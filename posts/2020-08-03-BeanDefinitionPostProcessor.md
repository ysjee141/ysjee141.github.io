---
title: BeanDefinitionRegistryPostProcessor의 사용
category: Server-Side
tags: [SpringBoot]
---

Spring에서 어플리케이션이 시작될 때 동적으로 Bean을 생성하기 위해서는 다양한 방법이 존재한다.
앞서에는 Application Context 의 Event Listener를 통해 동적 Bean을 생성하는 방법을 소개한 적이 있는데, 
이번에는  `BeanDefinitionRegistryPostProcessor`를 통해 동적 Bean을 생성하는 방법을 정리하려 한다.

좀 더 자세한 이해가 필요하겠지만, 지금까지 내가 이해한 것으로는 Event Listener를 통해 동적 Bean을 생성하는 것과 
`BeanDefinitionRegistryPostProcessor`를 통해 동적 Bean을 생성하는 것의 결정적인 차이는 생성 시점으로 생각된다.

Application Context의 Event는 생성/갱신/중지/종료 시점에 동작을 하게된다.
반면에 `BeanDefinitionRegistryPostProcessor`는 Spring이 Component Scan을 하기 이전 또는 
실행하면서 발생하는 것이 아닌가 싶다. 이 부분은 자세한 조사를 통해 다시 정리토록 하겠다.

# Code Sample

본 포스트의 주 목적은 'BeanDefinitionRegistryPostProcessor'의 사용이므로, 이 부분에 집중하기로 하자.
아래 예제를 참고하자

```java
public class PostProcessor implements BeanDefinitionRegistryPostProcessor {
	@Override
	public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry beanFactory) throws BeansException {
		...
	}

	@Override
	public void postProcessBeanFactory(ConfigurableListableBeanFactory configurableListableBeanFactory) throws BeansException {
        ...
	}
}
```
`BeanDefinitionRegistryPostProcessor`를 사용하기 위해서는 인터페이스를 통해 구현 클래스를 개발하면 된다.<br>
Override되어야 하는 함수는 다음과 같다.
* postProcessBeanDefinitionRegistry(BeanDefinitionRegistry beanFactory): BeanFactory를 이용하여 빈 정보를 등록하는 경우 이용
* postProcessBeanFactory(ConfigurableListableBeanFactory configurableListableBeanFactory): BeanDefinitionRegistry를 이용하여 빈 정보를 등록하는 경우 이용

# 정리

나의 경우에는 Dynamic Mapper를 구현하는 과정에서 @MapperScan Annotation이 없이 
Custom Annotation을 통해 Mapper Class 들을 Bean으로 등록하여 사용하고자 하는 것이 목적이였다.
그런데 Application Context Event를 통해 이를 구현하였더니, ContextRefreshedEvent는 
이미 Autowired Bean의 등록 및 스캔이 완료된 시점에서 호출이 되는지 @MapperScan이 누락이 되면 
Autowired 설정한 Class를 찾지 못해 오류가 발생하였다.

이러한 상황을 `BeanDefinitionRegistryPostProcessor`를 통해 구현했더니, 위 문제가 해결되었다.

Spring에서 Bean이 등록되고 동작되는 방식에 대한 자세한 학습이 필요할 듯하다...