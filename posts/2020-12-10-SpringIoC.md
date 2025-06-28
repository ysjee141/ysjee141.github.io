---
title: Spring Framework IoC, DI란
date: "2020-12-10"
category: Spring
tags: [Spring, IoC, DI]
refs:
    - https://biggwang.github.io/2019/08/31/Spring/IoC,%20DI%EB%9E%80%20%EB%AC%B4%EC%97%87%EC%9D%BC%EA%B9%8C/
    - https://developer.mozilla.org/ko/docs/Web/HTTP/Headers/Cache-Control

---

Spring 을 사용하다보면 필연적으로 IoC와 DI란 용어를 접하게 된다. 
그러나 IoC와 DI를 제대로 이해하고 사용하는가에 대해 물어본다면 사실 그렇지 않다라고 대부분의 개발자는 이야기할 것이다.
본 포스트에서는 이러한 Spring 의 IoC와 DI의 개념과 동작방식을 설명하고자 한다.

## IoC(Inversion of Control)이란 무엇인가?

IoC 란 용어는 90년대 중반 GoF 디자인 패턴에서 언급되었다고 한다. 즉, IoC는 Spring 에 국한된 용어가 아닌
개발 패턴에 대한 보편적인 용어라고 이해하는게 맞다. IoC 를 직역하면 "제어의 역전"인데, 무엇에 대한 제어를 어떻게 한다는 것인가?
다음의 예제 코드를 살펴보자.

```java
public class Task {

    private Alarm alarm;

    public Task() {
        alarm = new Alarm();
    }

}
```
개발자라면 굉장히 익숙한 코드일 것이다. Task 클래스는 Alarm 클래스에 의존적이며, 이를 위해 코드를 통해 개발자가
직접 Alarm 인스턴스를 생성하여 의존관계를 나타내고 있다.

반면, 다음의 코드를 살펴보면 조금 다르다.
```java
public class Task {

    @Autowired
    private Alarm alarm;

}
```
Spring 개발자라면, 매우 흔하게 사용하고 있는 문법의 코드일 것이다. 이는 Alarm 인스턴스가 Spring Container 에 관리되고 있는
Bean 이라면 @Autowired 를 통해 인스턴스를 주입받게 된다. 이는 개발자가 직접 의존성에 대해 직접 제어를 하는 것이 아니라,
Spring Framework 에서 직접 처리하는 것이다. 즉, 의존성에 대한 관리를 개발자 또는 코드가 아닌 Framework 이 대신 하여 준다, 
즉 제어가 역전되었다 라고 이야기할 수 있다.

IoC 의 종류는 의존성 주입(DI: Dependency Injection)과 의존성 룩업(DL, Dependency Lookup)이 있다. 
의존성 룩업(DL)은 개발자가 의존성 풀(Dependency Pull)을 통해 의존성의 참조를 가져와 사용하는 방식이며, 
오랜 시간 Java 를 개발한 개발자라면 매우 익숙한 방식이며, 코드 상으로 매우 직관적이다.

아래 코드는 Spring에서 제공하는 의존성 풀을 통해 의존성 룩업을 하는 코드의 예제이다. 
```java
public class DependencyPull {
    ApplicationContext = ctx = new ClassPathXmlApplicationContext("spring/app-context.xml");
    MessageRenderer mr = ctx.getBean("renderer", MessageRenderer.class);
    mr.render();
}
```

의존성 주입(DI)는 개발자가 아닌 Framework 와 같은 Container 에서 직접 인스턴스에 대한 관리 및 주입을 책임지는 방식이다.
