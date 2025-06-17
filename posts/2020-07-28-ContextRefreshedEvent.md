---
title: Spring Boot Application Context Event
category: Server-Side
tags: [SpringBoot]
---

**[상황]**
>어플리케이션을 개발하다보니 다중 Data Source의 사용이 필요하다. 
>먼저 Data Source를 정의하고, Data Source와 연결되는 SessionFactory, SessionTemplate, TransactionManager를
>각각 정의해서 개발환경을 구축하고, 개발.page__content을 진행했다.
>개발을 진행하던 와중에 Data Source를 추가가 필요해서 위 작업을 동일하게 작업을 진행하였다.
>Data Source 정의만으로 위의 작업을 자동화 할 수 있다면, 보다 나은 개발환경이 구축되지 않을까?

위 상황과 같이 다중 Data Source를 사용하기 위해서는 Data Source를 사용할 수 있는 SqlSession 등을 
각각 정의해서 사용해야 한다. 이러한 작업은 생각보다 번거롭고 귀찮은 작업이다. 또, 이를 위해 
소모되는 시간도 신경을 안쓸 수는 없을 것이다.

이를 해결하기 위해 Data Source만을 정의함으로써 MyBatis SessionFactory, SessionTemplate, 
TransactionManager를 자동으로 생성해서 Bean으로 등록해보기로 했다.(이번 포스트에서는 자동화 코드는 다루지 않는다.)

이를 위해서 어플리케이션이 시작될 때 위 작업을 자동화해야 했으며, Bean 등록에 필요한 
Application Context 가져올 방법을 찾던 중 Application Context에 대한 Event Listener을 알게 되었다.

어플리케이션이 실행될 때 일어나는 이벤트는 다음과 같다.
* ContextRefreshedEvent: ApplicationContext를 초기화 하거나, Refresh 할 경우 발생
* ContextStartedEvent: ApplicationContext를 start()하여 LifeCycle이 시작되는 시점에 발생
* ContextStoppedEvent: ApplicationContext를 stop()하여 LifeCycle이 정지되는 시점에 발생
* ContextClosedEvent: ApplicationContext를 close()하여 LifeCycle이 종료되는 시점에 발생

위 이벤트를 위한 EventHandler(또는 EventListener)는 아래와 같이 구현할 수 있다.
```java
@Component
public class ApplicationCtxHandler {
    @EventListener
    public void handle(ContextRefreshedEvent event) {
        ApplicationContext context = event.getApplicationContext();
    }

    @EventListener
    public void handle(ContextStartedEvent event) {
        ApplicationContext context = event.getApplicationContext();
    }

    @EventListener
    public void handle(ContextStoppedEvent event) {
        ApplicationContext context = event.getApplicationContext();
    }

    @EventListener
    public void handle(ContextClosedEvent event) {
        ApplicationContext context = event.getApplicationContext();
    }
}
```

ContextRefreshedEvent 이벤트의 경우 ApplicationContext가 변경되는 시점에서 호출되기 때문에,
중복하여 호출될 수 있다는 것을 반드시 유의해야 한다.

**[참고]**
* [[Spring] 스프링 시작시점에서 프로그램 동작할 수 있게 하는 방법](https://yuien.tistory.com/entry/%EC%8A%A4%ED%94%84%EB%A7%81-%EC%8B%9C%EC%9E%91%EC%8B%9C%EC%A0%90%EC%97%90%EC%84%9C-%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%A8-%EB%8F%99%EC%9E%91%ED%95%A0-%EC%88%98-%EC%9E%88%EA%B2%8C-%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95)
* [[Spring] ApplicationEventPublisher를 통한 스프링 이벤트 처리(ApplicationEventPublisher, Spring Event Processing)](https://engkimbs.tistory.com/718)