---
title: 다중 데이터 소스를 통한 동적 MyBatis Mapper Scanner 생성
date: "2020-08-04"
category: Server-Side
tags: [SpringBoot,MyBatis]
source: https://github.com/ysjee141/dynamic-mapper-scanner
refs:
    - https://thecodinglog.github.io/spring/2019/01/29/dynamic-spring-bean-registration.html
    - http://wiki.sys4u.co.kr/pages/viewpage.action?pageId=7767258
---

어플리케이션을 개발하다보면 다중 Data Source를 사용해야 하는 경우가 생각보다 많다.<br>
일반적으로 MyBatis를 통해 Database 개발을 하기 위해서는 보통은 다음과 같은 절차를 통해 개발을 진행한다.
1. Data Source 정의
2. SessionFactory / SessionTemplate 정의 - 선언한 Data Source 연결
3. TransactionManager 정의 - 선언한 Data Source 연결
4. Mapper Interface를 통해 Database 사용

Data Source가 추가되면 위 절차와 같은 작업을 반복해서 설정한다. 이러한 과정은 의외로 귀찮고, 불편한 작업이다.
이를 해결하기 위해서 DataSource 정의만을 통해 위 작업을 자동화 하는 것을 시도해보았다.

## 핵심

동적 Bean 생성의 핵심은 언제 Bean을 생성하여 등록할 것인가? 일 것이다. 동적 Bean을 생성하기 위해서는 아래와 같은 다양한 방법이 있다.
* Bean Hooker Interface
    * BeanDefinitionRegistryPostProcessor: Bean 정의를 등록하는 것에 초점이 맞춰진 Interface
    * BeanFactoryPostProcessor: 빈 정의 자체를 재정의하거나 Property를 추가하기 위해 사용
    * BeanPostProcessor: Instance 화 된 Bean을 변경을 하기 위해 사용<br>
    ※ `BeanDefinitionRegistryPostProcessor`,`BeanFactoryPostProcessor`는 Bean이 Instance 화 되기 전에 호출됨
* Application Context Event
    * ContextRefreshedEvent: ApplicationContext를 초기화 하거나, Refresh 할 경우 발생
    * ContextStartedEvent: ApplicationContext를 start()하여 LifeCycle이 시작되는 시점에 발생
    * ContextStoppedEvent: ApplicationContext를 stop()하여 LifeCycle이 정지되는 시점에 발생
    * ContextClosedEvent: ApplicationContext를 close()하여 LifeCycle이 종료되는 시점에 발생

이번 포스팅에서는 `BeanDefinitionRegistryPostProcessor`를 활용하여 진행할 생각이다.

`BeanDefinitionRegistryPostProcessor`는 아래와 같이 사용이 가능하며, 
자세한 내용은 ['BeanDefinitionRegistryPostProcessor의 사용'](/blog/server-side/BeanDefinitionPostProcessor/){:target="_blank"}을 통해
확인할 수 있다. (아직 많은 부분의 수정이 필요하지만...)

```java
public class MapperBeanPostProcessor implements BeanDefinitionRegistryPostProcessor {
    @Override
	public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry beanFactory) throws BeansException {
        // BeanDefinition을 통해 Bean을 추가할 경우 이용
	}
	@Override
	public void postProcessBeanFactory(ConfigurableListableBeanFactory configurableListableBeanFactory) throws BeansException {
        // SingleTone Bean을 추가할 경우 이용
	}
}
```

## 구현

### Data Source Property Class 

이번 포스팅에서 다룰 예제는 정의된 Data Source를 통해 동적 Bean을 생성하는 것이다. 따라서 Data Source를 정의하기 위한
방법이 필요하며, 다중 Data Source의 정의가 가능해야 하기 때문에 아래와 같이 List 형식의 Property Class를 작성한다.
```java
public class RepoConfig extends ArrayList<RepoConfig.DsConfig> {

  public static RepoConfig init(Environment environment, String prefix) {
    return Binder.get(environment).bind(prefix, RepoConfig.class).get();
  }

  public static class DsConfig {
    private String name;
    private Map<String, String> dataSource;

    private MapperOrder order;

    public MapperOrder getOrder() {
      return order;
    }

    public void setOrder(MapperOrder order) {
      this.order = order;
    }

    public String getName() {
      return name;
    }

    public String getName(BEAN_TYPE beanType) {
      return this.name.concat(beanType.getSuffix());
    }

    public String getMapperLocation() {
      return "classpath*:/mapper/" + this.name + "/*.xml";
    }

    public void setName(String name) {
      this.name = name;
    }

    public Map<String, String> getDataSource() {
      return dataSource;
    }

    public void setDataSource(Map<String, String> dataSource) {
      this.dataSource = dataSource;
    }
  }
}
```

`BeanDefinitionRegistryPostProcessor`는 위에서 설명한바와 같이 Bean Instance화 되기 전에 호출이 되기 때문에,
`@ConfigurationProperties` Annotation을 통해 Property를 가져와 사용할 수가 없었다.
따라서 Processor Bean 생성시 Environment를 전달받아 prefix를 통해 직접 Property를 가져와 Binding하도록 하였다.
```java
public static RepoConfig init(Environment environment, String prefix) {
    return Binder.get(environment).bind(prefix, RepoConfig.class).get();
}
```
물론 Processor가 아닌 다른 서비스 로직에서 사용하기 위해서는 AutoConfiguration으로 설정하여 사용도 가능하다.

실제 Data Source 정보를 저장하기 위해서 내부에 Sub Class를 생성하고, Property Class는 ArrayList<T>를 상속 받고, 
Generic을 Sub Class로 지정하였다. 다음과 같이 YAML 또는 Properties 파일애 Data Source 정보를 설정하면, 
Property Class에 정보가 주입된다.
```yaml
datasource3:
  - name: datasourceOne
    order: 1
    data-source:
      jdbcUrl: jdbc:h2:file:d:/test_db;AUTO_SERVER=TRUE
      username: test
      password: test
      driverClassName: org.h2.Driver
      maximumPoolSize: 20
```
```java
// Annotation을 통한 Property 주입
@Bean
@ConfigurationProperties(prefix = "datasource")
public RepoConfig getConfig() {
    return new RepoConfig();
}

// RepoConfig.init() Method를 통해 주입
@Bean
public RepoConfig getConfig(Environment env) {
    return RepoConfig.init(env, "datasource3");
}
```

### BeanDefinitionRegistryPostProcessor 

`BeanDefinitionRegistryPostProcessor` 사용한 결정적인 이유는 어플리케이션 내 `@MapperScan` Annotation을 선언하지 않고,
Mapper Interface 들을 Scan 하기 위함이다. PostProcessor가 아닌 Application Context Event Listener를 통해 기능을 구현하였더니,
Bean Instance 화 과정에서 Mapper Interface를 Autowired 하는 과정에서 오류가 발생하고, 어플리케이션이 종료되었다.

이에 Bean Instance 화 이전에 MapperScanner를 생성하여, Mapper Interface를 Scan 하기 위해 PostProcessor를 이용하니,
위와 같은 문제가 해결되었다.

PostProcessor는 아래와 같이 개발할 수 있다.
```java
public class MapperBeanPostProcessor implements BeanDefinitionRegistryPostProcessor {

	private final RepoConfig repo;

	public MapperBeanPostProcessor(RepoConfig repo) {
		this.repo = repo;
	}

	@Override
	public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry beanFactory) throws BeansException {
		repo.forEach((v) -> {
			registerDataSource(beanFactory, v);         // DataSource 등록
			registerSqlSessionFactory(beanFactory, v);  // SqlSessionFactory
			registerSqlSessionTemplate(beanFactory, v); // SqlSessionTemplate
			registerTransactionManager(beanFactory, v); // TransactionManager
			registerMapperScanner(beanFactory, v);      // MapperScannerConfigurer
		});
	}

	@Override
	public void postProcessBeanFactory(ConfigurableListableBeanFactory configurableListableBeanFactory) throws BeansException {
    }

	private void registerDataSource(
			BeanDefinitionRegistry registry, RepoConfig.DsConfig config
	) {
        // Data Source Bean 등록
        // Bean 생성 및 등록 Sample Code 
        GenericBeanDefinition dataSourceBeanDefinition = new GenericBeanDefinition();
        dataSourceBeanDefinition.setBeanClass(HikariDataSource.class);
        dataSourceBeanDefinition.setPropertyValues(
            new MutablePropertyValues(config.getDataSource())
        );

        registry.registerBeanDefinition(
            config.getName(RepoConfig.BEAN_TYPE.DATASOURCE),
            dataSourceBeanDefinition
        );
	}

	private void registerSqlSessionFactory(BeanDefinitionRegistry registry, RepoConfig.DsConfig config) {
		// SessionFactory Bean 등록
	}

	private void registerSqlSessionTemplate(BeanDefinitionRegistry registry, RepoConfig.DsConfig config) {
		// SessionTemplate Bean 등록
	}

	private void registerTransactionManager(BeanDefinitionRegistry registry, RepoConfig.DsConfig config) {
		// TransactionManager Bean 등록
	}

	private void registerMapperScanner(BeanDefinitionRegistry registry, RepoConfig.DsConfig config) {
		// MapperScanner Bean 등록
	}
}
```

### AutoConfiguration

`BeanDefinitionRegistryPostProcessor`의 사용을 위해서는 PostProcessor 또한 Bean으로 등록해주어야 한다.<br>
아래와 같이 사용이 가능하다.

```java
@Configuration
@ConditionalOnPropertyForList(prefix = MapperConfig.PROPERTY_PREFIX)
public class MapperConfig {

	static final String PROPERTY_PREFIX = "datasource3";

	@Bean
	public BeanDefinitionRegistryPostProcessor postProcessor(Environment environment) {
		try {
			return new MapperBeanPostProcessor(
					RepoConfig.init(environment, MapperConfig.PROPERTY_PREFIX)
			);
		} catch (NoSuchElementException e) {
			e.printStackTrace();
		}
		return null;
	}
}
```

@ConditionalOnPropertyForList Annotation은 Prefix를 통해 Environment에 Property가 있는지를 판단하기 위해
작성한 Custom Annotation이다. 본 예제의 코드를 공용 모듈로 활용한다면, Data Source를 사용하지 않을 경우
어플리케이션 실행간 오류가 발생할 수 있기 때문에 이러한 경우에는 Bean을 생성하지 않도록 추가하였다.

Annotation의 코드는 아래와 같다.
```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD})
@Documented
@Conditional({ConditionalOnPropertyForList.OnPropertyCondition.class})
public @interface ConditionalOnPropertyForList {
	String prefix() default "";

	class OnPropertyCondition implements Condition {

		@Override
		public boolean matches(ConditionContext conditionContext, AnnotatedTypeMetadata metadata) {
			String prefix = (String) Objects.requireNonNull(metadata.getAnnotationAttributes(
					ConditionalOnPropertyForList.class.getName()
			)).get("prefix");

			RepoConfig repoConfig = Binder.get(conditionContext.getEnvironment())
					.bind(prefix, RepoConfig.class)
					.orElse(new RepoConfig());

			return !repoConfig.isEmpty();
		}
	}
}
```

## 정리

이번 포스팅의 핵심은 PostProcessor를 통해 Bean의 Instance화 이전에 Bean을 주입하고, 그에 따라 MyBatis를 사용함에 있어
보다 간결한 개발환경을 구축할 수 있다. 일 것 같다.

본 포스팅에서 다룬 코드는 아래의 Github Repository에서 확인이 가능하다.<br>
동적 Bean을 생성하기 위해서 몇번의 시행착오를 겪었으며, 이로 인해 Spring의 IoC / DI에 대한 심도있는
학습이 필요함을 새삼 깨달았다. 여기에서는 간단하게 다루었지만, 이에 대한 내용 또한 별도의 포스팅을 통해 정리해볼 예정이다.

**[정리예정]**
* Spring Bean Life Cycle
* Custom Conditional Annotation
* Spring Boot Auto Configuration