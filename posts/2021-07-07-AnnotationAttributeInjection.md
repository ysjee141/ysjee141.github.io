---
title: Annotation Attribute Value 변경하기
date: "2021-07-07"
category: Spring
tags: [Spring, Annotation, Invocation]
refs:
- https://www.programmersought.com/article/60431768611/
---

최근 개발을 진행하면서 Custom Annotation을 활용하게 되었는데, Annotation Attribute 값에 System Property Key를 지정하여
해당 값을 가져와 Annotation의 다른 Attribute에 주입해야만 하는 일이 생겼다.

확인해보니 Annotation Attribute에 값을 지정하기 위해서는 @Value Annotation과 같은 Annotation의 사용이 불가능하고,
직접 값을 주입하거나 상수(final) 값만이 지정이 가능해서 난감했다.

이러저러한 방법을 찾던 도중 InvocationHandle을 통해 Proxy 패턴으로 값을 주입할 수 있었다.
이를 위해서 BeanPostProcessor를 통해 Handler를 구현하여 처리가 가능했고, 그 내용을 아래와 같이 공유한다.

Spring 을 사용하다보면 필연적으로 IoC와 DI란 용어를 접하게 된다.
그러나 IoC와 DI를 제대로 이해하고 사용하는가에 대해 물어본다면 사실 그렇지 않다라고 대부분의 개발자는 이야기할 것이다.
본 포스트에서는 이러한 Spring 의 IoC와 DI의 개념과 동작방식을 설명하고자 한다.

---

### 완성 코드
```java
@Component
public class EntWrapperServiceAnnotationHandler implements BeanPostProcessor {

  private final Environment environment;

  public EntWrapperServiceAnnotationHandler(Environment environment) {
    this.environment = environment;
  }

  @Override
  public Object postProcessBeforeInitialization(Object bean,
      @SuppressWarnings("NullableProblems") String beanName)
      throws BeansException {

    // BeanPostProcessor 는 모든 Bean 이 생성될 때 호출되기 때문에
    // EntWrapperService Type Annotation 및 상위 클래스가 BaseWrapper 인 경우에만 수행되도록 조건 처리
    if (bean.getClass().isAnnotationPresent(EntWrapperService.class)
        && bean.getClass().getSuperclass().equals(BaseWrapper.class)) {
      try {
        EntWrapperService annotation = bean.getClass().getAnnotation(EntWrapperService.class);

        // prefix 값이 비어 있는 경우 수행하지 않음
        if (!annotation.prefix().equals("")) {
          EntWrapperServicePropertyHolder holder = Binder.get(environment)
              .bind(annotation.prefix(), EntWrapperServicePropertyHolder.class)
              .orElse(null);

          if (holder != null) {
            // Annotation Attribute 값을 변경하기 위해 Proxy 를 통한 Invocation 처리
            InvocationHandler invocationHandler = Proxy.getInvocationHandler(annotation);
            Field f = invocationHandler.getClass().getDeclaredField("memberValues");
            f.setAccessible(true);
            //noinspection unchecked
            holder.setToAnnotation((Map<String, Object>) f.get(invocationHandler));

            // Bean Lifecycle 혼선 방지를 위해 Annotation Attribute 값 변경 후 직접 Bean Init 수행
            // 상위 클래스인 BaseWrapper#init() Invoking 을 위해 Lookup 사용
            MethodHandles.privateLookupIn(bean.getClass(), MethodHandles.lookup())
                .in(bean.getClass())
                .findSpecial(BaseWrapper.class, "init",
                    MethodType.methodType(void.class), bean.getClass())
                .invoke(bean);
          } else {
            throw new Exception("ddd");
          }
        }
      } catch (Throwable e) {
        e.printStackTrace();
      }
    }
    return BeanPostProcessor.super.postProcessBeforeInitialization(bean, beanName);
  }
}
```

BeanPostProcessor 는 서비스 구동시 선언된 모든 Bean이 생성될 때 마다 호출이 된다.
때문에 반드시 필요한 Bean 형식인 경우에 한하여 구동하도록 조건을 걸도록 한다. 이번에는 EntWrapperService 라는 Annotation이 선언되었으며
BaseWrapper 클래스를 상속받은 Bean에 한정하여 구동되도록 조건을 걸어 두었다.
```java
if (bean.getClass().isAnnotationPresent(EntWrapperService.class)
        && bean.getClass().getSuperclass().equals(BaseWrapper.class)) { }
```

Annotation Attribute 값을 주입하기 위해서는 직접 주입이 불가능하고, Proxy 패턴을 활용하여
Invocation 처리하는 것이 필요하다. 이를 위한 코드는 아래와 같다.
```java
EntWrapperService annotation = bean.getClass().getAnnotation(EntWrapperService.class);

InvocationHandler invocationHandler = Proxy.getInvocationHandler(annotation);
Field f = invocationHandler.getClass().getDeclaredField("memberValues");
f.setAccessible(true);
Map<String, Object> values = (Map<String, Object>) f.get(invocationHandler);
String newValue = "newValue";
values.put("baseUrl", newValue);
```

Proxy.getInvocationHandler() 를 통해 값을 변경하려는 대상 Object에 대한 InvocationHandler를 생성한다. 
이후 생성된 InvocationHandler를 값을 변경하면 되는데, Annotation 타입의 경우 Attribute 값이 Map<String, Object> 형식의
memberValues 필드에 값이 저장되어 있다. 따라서 해당 필드를 가져와 값을 변경하여 주면 원본 Instance의 값이 변경된다.
이는 JDK에서 제공하는 Proxy 클래스를 통해서 원본 객체를 바꿔주는 방식이다. JDK는 이러한 과정을 Proxy 클래스를 통한 Proxy 패턴을 구현하여 준다.
추가적으로 설명을 하자면, Proxy.getInvocationHandler()를 통해 생성된 InvocationHandler를 활용하면, 기존에 선언된
Method의 동작에 추가 동작을 주입하는 것도 가능하다. 이 부분에 대해서는 기회가 되면 포스팅 하도록 하겠다.

이번 작업에서는 새로 주입된 Annotation Attribute 값을 상위 클래스인 BaseWrapper에서 사용해야 하는 경우였다.
BaseWrapper의 경우에는 Bean 형식이 아니기 때문에 직접 생성자를 지정해야하는데 BeanPostProcessor를 통해 Annotation Attribute 값을
주입하다보니, BaseWrapper의 생성 시기와 Annotation Attribute 값이 주입되는 시기가 어긋나는 경우가 발생하였다.
이를 위해서 Annotation Attribute 값 주입이 끝난 후 Reflection을 통해 직접 상위 클래스의 init() Method를 직접 호출하는 방식을
적용하였다. 단, 무분별한 호출을 막기 위해 상위 클래스의 init() Method는 protected 로 선언하였더니 직접적인 invoke가 불가능하였다.
이를 위해 아래의 코드를 통해 private scope 의 Method의 호출에 성공할 수 있었다.
```java
 MethodHandles.privateLookupIn(bean.getClass(), MethodHandles.lookup())
    .in(bean.getClass())
    .findSpecial(BaseWrapper.class, "init",
        MethodType.methodType(void.class), bean.getClass())
    .invoke(bean);
```
이와 같은 코드를 활용하면 마치 상속 받은 클래스에서 상위 클래스의 Method를 호출하는 것과 같은 효과를 볼 수 있다.