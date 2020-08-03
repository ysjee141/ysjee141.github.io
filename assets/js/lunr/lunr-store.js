var store = [{
        "title": "Spring Boot Application Context Event",
        "excerpt":"[상황]     어플리케이션을 개발하다보니 다중 Data Source의 사용이 필요하다.     먼저 Data Source를 정의하고, Data Source와 연결되는 SessionFactory, SessionTemplate, TransactionManager를 각각 정의해서 개발환경을 구축하고, 개발.page__content을 진행했다.     개발을 진행하던 와중에 Data Source를 추가가 필요해서 위 작업을 동일하게 작업을 진행하였다.     Data Source 정의만으로 위의 작업을 자동화 할 수 있다면, 보다 나은 개발환경이 구축되지 않을까?    위 상황과 같이 다중 Data Source를 사용하기 위해서는 Data Source를 사용할 수 있는 SqlSession 등을  각각 정의해서 사용해야 한다. 이러한 작업은 생각보다 번거롭고 귀찮은 작업이다. 또, 이를 위해  소모되는 시간도 신경을 안쓸 수는 없을 것이다.   이를 해결하기 위해 Data Source만을 정의함으로써 MyBatis SessionFactory, SessionTemplate,  TransactionManager를 자동으로 생성해서 Bean으로 등록해보기로 했다.(이번 포스트에서는 자동화 코드는 다루지 않는다.)   이를 위해서 어플리케이션이 시작될 때 위 작업을 자동화해야 했으며, Bean 등록에 필요한  Application Context 가져올 방법을 찾던 중 Application Context에 대한 Event Listener을 알게 되었다.   어플리케이션이 실행될 때 일어나는 이벤트는 다음과 같다.     ContextRefreshedEvent: ApplicationContext를 초기화 하거나, Refresh 할 경우 발생   ContextStartedEvent: ApplicationContext를 start()하여 LifeCycle이 시작되는 시점에 발생   ContextStoppedEvent: ApplicationContext를 stop()하여 LifeCycle이 정지되는 시점에 발생   ContextClosedEvent: ApplicationContext를 close()하여 LifeCycle이 종료되는 시점에 발생   위 이벤트를 위한 EventHandler(또는 EventListener)는 아래와 같이 구현할 수 있다.  @Component public class ApplicationCtxHandler {     @EventListener     public void handle(ContextRefreshedEvent event) {         ApplicationContext context = event.getApplicationContext();     }      @EventListener     public void handle(ContextStartedEvent event) {         ApplicationContext context = event.getApplicationContext();     }      @EventListener     public void handle(ContextStoppedEvent event) {         ApplicationContext context = event.getApplicationContext();     }      @EventListener     public void handle(ContextClosedEvent event) {         ApplicationContext context = event.getApplicationContext();     } }   ContextRefreshedEvent 이벤트의 경우 ApplicationContext가 변경되는 시점에서 호출되기 때문에, 중복하여 호출될 수 있다는 것을 반드시 유의해야 한다.   [참고]     [Spring] 스프링 시작시점에서 프로그램 동작할 수 있게 하는 방법   [Spring] ApplicationEventPublisher를 통한 스프링 이벤트 처리(ApplicationEventPublisher, Spring Event Processing)  ","categories": ["Server-Side"],
        "tags": ["SpringBoot"],
        "url": "https://ysjee141.github.io/blog/server-side/ContextRefreshedEvent/",
        "teaser": null
      },{
        "title": "JMH(Java Microbenchmark Harness) 사용법",
        "excerpt":"개발을 진행하다가 보면, 성능문제를 해결해야 하는 경우는 매우 많다. 성능 문제를 해결하기 위해서는 우선 성능을 측정해야하며, 성능을 측정하는 방법와 도구는 셀수도 없이 많다.  대부분의 경우 개발환경 또는 운영환경에 어플리케이션이 배포가 되고, Stress Test를 진행하여 성능을 측정한다.  이러한 방법은 매우 일반적이며 어플리케이션의 성능을 개선하기 위해서는 당연히 수행해야 하는 작업이다.   이러한 성능 도구는 어플리케이션의 기능 수행 측면에서의 성능 측정이고,  일부 로직에 대한 성능을 측정하고 비교하기에는 무거운 감이 없지 않다.  개발을 하다보면, 특정 코드에 대한 간단한 비교가 필요하기도 하고, 학습을 위해 각 코드에 대한  성능을 비교해야 할 경우도 많이 있을 것이다. 이렇듯 코드에 대한 성능측정을 하기 위한 방법을 찾던 중  JMH(Java Microbenchmark Harness)란 도구를 알게 되어 사용법을 정리해 본다.   참고로, JMH는 Oracle의 JIT Compiler 개발자가 만든 것이기 때문에  타 Benchmark Framework 보다 신뢰할 수 있다는 장점이 존재한다.   Maven 프로젝트 생성 및 Dependency 설정   JMH를 통해 벤치마킹 테스트를 하기 위해서는 Project를 생성해야 한다. 만약, 이미 만들어진 프로젝트에  JMH을 사용하려면 Maven Dependency를 추가하면 된다.   Maven Project 생성  $ mvn archetype:generate \\     -DinteractiveMode=false \\      -DarchetypeGroupId=org.openjdk.jmh \\      -DarchetypeArtifactId=jmh-java-benchmark-archetype \\      -DgroupId=com.happl.test \\     -DartifactId=code-benchmark \\     -Dversion=1  Maven Dependency    &lt;dependency&gt;     &lt;groupId&gt;org.openjdk.jmh&lt;/groupId&gt;     &lt;artifactId&gt;jmh-core&lt;/artifactId&gt;     &lt;version&gt;1.19&lt;/version&gt;   &lt;/dependency&gt;   &lt;dependency&gt;     &lt;groupId&gt;org.openjdk.jmh&lt;/groupId&gt;     &lt;artifactId&gt;jmh-generator-annprocess&lt;/artifactId&gt;     &lt;version&gt;1.19&lt;/version&gt;   &lt;/dependency&gt;   JMH를 통한 Benchmark 테스트   성능 측정을 위해서는 JMH에서 지원하는 Annotation을 사용하여 코드를 작성하면 된다. 예제는 아래와 같다.  ArrayList에 데이터를 넣은 후 반복문을 돌리는 테스트 코드이다.  @State(Scope.Thread) @BenchmarkMode(Mode.AverageTime) @OutputTimeUnit(TimeUnit.MILLISECONDS) public class LoopTest {      final LIMIT_COUNT = 10000;     final List&lt;Integer&gt; array = new ArrayList&lt;&gt;();  \t@Setup \tpublic void init() {         // 성능 측정 전 사전에 필요한 작업         for(int i = 0; i &lt; LIMIT_COUNT; i++) {             array.add(i);         } \t}  \t@Benchmark \tpublic void originLoopWithGetSize() {         // 성능을 측정할 코드 작성         int size = array.size();         for(int i = 0; i &lt; size; i++) {             processor(i);         } \t}      Integer temp = 0;     public void processor(Integer i) {         temp = i;     }      public static void main(String[] args) throws IOException, RunnerException {         Options opt = new OptionsBuilder()                 .include(LoopTest.class.getSimpleName())                 .warmupIterations(10)           // 사전 테스트 횟수                 .measurementIterations(10)      // 실제 측정 횟수                 .forks(1)                       //                  .build();         new Runner(opt).run();                  // 벤치마킹 시작     } }  SELECT CODE FROM TBL_CODE GROUP BY CODE   측정이 완료되면 다음과 같은 결과가 출력된다.  # Run complete. Total time: 00:01:43  Benchmark                       Mode  Cnt  Score   Error  Units LoopTest.forEach                avgt   10  0.990 ± 0.096  ms/op LoopTest.forEachByJdk8          avgt   10  0.703 ± 0.160  ms/op LoopTest.forEachByStream        avgt   10  0.561 ± 0.057  ms/op LoopTest.originLoop             avgt   10  0.634 ± 0.117  ms/op LoopTest.originLoopWithGetSize  avgt   10  0.876 ± 0.093  ms/op   Annotation 정리   @BenchmarkMode  JMH는 벤치마크를 다양항 방법을 수행할 수 있으며, 이를 지정하기 위해 @BenchmarkMode를 사용한다.   사용가능한 방법은 아래 참조                  Mode       Description                       Throughput       초당 작업수 측정, 기본값                 AverageTime       작업이 수행되는 평균 시간을 측정                 SampleTime       최대, 최소 시간 등 작업이 수행하는데 걸리는 시간을 측정                 SingleShotTime       단일 작업 수행 소요 시간 측정, Cold Start(JVM 예열 없이) 수행하는데 적격                 All       위 모든 시간을 측정           예제 코드(http://tutorials.jenkov.com/java-performance/jmh.html)   public class MyBenchmark {      @Benchmark @BenchmarkMode(Mode.Throughput)     public void testMethod() {         // This is a demo/sample template for building your JMH benchmarks. Edit as needed.         // Put your benchmark code here.          int a = 1;         int b = 2;         int sum = a + b;     }  }   @OutputTimeUnit   벤치마크 결과를 출력할 시간 단위를 설정할 수 있으며, java.util.concurrent.TimeUnit 열거형을 통해 설정이 가능하다.      NANOSECONDS(Default)   MICROSECONDS   MILLISECONDS   SECONDS   MINUTES   HOURS   DAYS   예제 코드(http://tutorials.jenkov.com/java-performance/jmh.html)   public class MyBenchmark {      @Benchmark @BenchmarkMode(Mode.Throughput) @OutputTimeUnit(TimeUnit.MINUTES)     public void testMethod() {         // This is a demo/sample template for building your JMH benchmarks. Edit as needed.         // Put your benchmark code here.          int a = 1;         int b = 2;         int sum = a + b;     }  }   @State   JMH는 벤치마크에 사용되어지는 Argument의 상태를 지정할 수 있다. 벤치마크 테스트를 진행하다보면 상황에 따라 Argument가 항상 초기화 되어야 할 때도 있고, 값이 항상 유지되어야 할 경우도 있을텐데 이것을 가능하게 하는 것이 @State Annotation이며, 정의 가능한 Scope는 아래와 같다.                  Scope       Description                       Thread       Thread별로 인스턴스 생성                 Benchmark       동일 테스트 내 모든 Thread에서 동일 Instance를 공유 (Multi-Threading 테스트)                 Group       Thread 그룹마다 Instance를 생성              @Steate Annotation이 적용되는 클래스는 다음과 같은 규칙을 준수해야 한다.         반드시 Public 클래스로 선언되어야 한다. 만약 중첩 클래스인 경우에는 static로 선언되어야 한다.     Argument가 없는 생성자가 반드시 있어야 한다. 위 규칙을 준수하면 @State Annotation을 클래스에 적용하여 JMH가 인식하도록 할 수 있다.      예제 코드(http://tutorials.jenkov.com/java-performance/jmh.html)   public class MyBenchmark {      @State(Scope.Thread)     public static class MyState {         public int a = 1;         public int b = 2;         public int sum ;     }       @Benchmark @BenchmarkMode(Mode.Throughput) @OutputTimeUnit(TimeUnit.MINUTES)     public void testMethod(MyState state) {         state.sum = state.a + state.b;     }  }   @Setup / @TearDown   @Setup 및 @TearDown Annotation은 상태 클래스의 Method에 적용이 가능하다. @Setup Annotation은 JMH에게  벤치마크가 시작되기 전 상태 Object를 설정하기 위해 사용한다. JUnit의 @Before와 같은 역할을 한다고 이해하면 쉽다. @TearDown Annotation은 벤치마크가 종료된 이후 상태 Object를 정리하기 위해 사용한다. JUnit의 @After와 같은 역할을 한다고 이해하자.  @Setup / @TearDown이 적용된 Method의 실행시간은 벤치마크 시간에 포함되지 않는다.   @Setup / @TearDown은 Level Arugement의 설정이 가능하며 설정 가능한 값은 다음과 같다.                  Level       Description                       Trial       벤치마크를 실행할 때 마다 한번씩 호출하며, 실행은 전체 Fork를 의미한다.                 Iteration       벤치마크를 반복 할 때마다 한번씩 호출                 Invocation       벤치마크를 메소드를 호출 할 때마다 호출           예제 코드(http://tutorials.jenkov.com/java-performance/jmh.html)   public class MyBenchmark {      @State(Scope.Thread)     public static class MyState {          @Setup(Level.Trial)         public void doSetup() {             sum = 0;             System.out.println(\"Do Setup\");         }          @TearDown(Level.Trial)         public void doTearDown() {             System.out.println(\"Do TearDown\");         }          public int a = 1;         public int b = 2;         public int sum ;     }      @Benchmark @BenchmarkMode(Mode.Throughput) @OutputTimeUnit(TimeUnit.MINUTES)     public void testMethod(MyState state) {         state.sum = state.a + state.b;     } }   Dead Code를 주의하라   JVM의 경우 Method 등에서 계산된 결과를 반환하거나, 사용되지 않으면 사용하지 않는 코드라고 인식, 해당 코드를 제가하는 경우가 있으며, 이를 Dead Code라 한다. 이러한 코드를 벤치마킹시  정확한 벤치마킹이 되지 않을 수 있으니 반드시 Dead Code를 작성하지 않도록 주의하자.   Dead Code의 예제는 아래와 같다.   public class MyBenchmark {      @Benchmark     public void testMethod() {         int a = 1;         int b = 2;         int sum = a + b;     }  }   위 코드를 보면 testMethod() 내에서 a + b의 계산이 사용하는 코드가 존재하지 않는다. 이러한 경우 JVM은 해당 코드를 Dead Code라고 인식하고 해당 코드의 값이 사용되지 않기  때문에 선언한 a와 b의 값 또한 사용되지 않는 것이기 때문에 같이 제거가 된다.   결국 벤치마크 코드에는 아무런 코드도 존재하지 않는 것이 되며, 테스터가 이러한 부분을 인식하지 못한다면, 굉장히 성능이 좋은 코드라고 오해할 소지가 충분하다. 하지만 정작 벤치마크는 실행되지 않은 것과 같다.   이러한 Dead Code를 회피하기 위해서는 아래와 같은 방법을 사용하는 것이 좋다.     Method가 결과 값을 Return 하도록 작성하라.   계산된 값을 JMH가 제공하는 “Black Hole” 함수를 통해 전달한다.   JMH가 제공하는 “Black Hole” 사용법   JMH는 벤치마크 코드에서 계산된 값을 반환하지 않아도 JVM에서 마치 사용하는 것처럼 인식하게 하는  Blackhole 방법을 제공하며, 예제는 다음과 같다.   public class MyBenchmark {      @Benchmark    public void testMethod(Blackhole blackhole) {         int a = 1;         int b = 2;         int sum = a + b;         blackhole.consume(sum);     } }   위 코드에서 보면 벤치마크 Method 내 blockhole.consume(sum) 코드를 확인할 수 있다. Method에  JMH가 제공하는 Blackhole 클래스를 Argument로 받고 해당 코드를 수행하면, Method 내에서 계산된 값을 넘겨주면 JVM에서는 계산된 값을 사용한 것으로 인식하여 정확한 측정이 가능하다. method 내 여러개의 계산된 값이 도출된다면 지속적으로 consume()를 호출하여 값을 전달하면 된다.   정리   JMH는 특정 클래스 또는 코드에 대한 벤치마크 테스트를 진행하는 것에 매우 좋은 방법으로 생각된다. 다만,  테스트해야 할 범위가 크거나 다양한 Action 또는 Step이 필요한 경우에는 적절한 방법은 아닌 것으로 보여지며,  이러한 경우에는 APM과 같은 어플리케이션 성능 테스트 솔루션을 활용하는 것이 좋을 것 같다.  JUnit과 JMH를 조합하여, 코드를 빌드하는 과정에서 사전 테스트를 한다면 좀더 나은 코드 품질을 확보할 수 있지 않을까 생각해본다.  ","categories": ["Quality"],
        "tags": ["Java","Benchmark","JMH","Performance"],
        "url": "https://ysjee141.github.io/blog/quality/java-benchmark/",
        "teaser": null
      },{
        "title": "블로그를 시작하며...",
        "excerpt":"요즘 개발자들은 누구라 할 것 없이 블로그를 하는 것 같습니다.  덕분에 참고할 자료가 많아져서 개발하기가 많이 수월해졌고 저 또한  이러한 블로그들을 참고하면서 개발을 진행하고, 지식을 습득하고 있습니다.   그러나 적지 않은 시간을 개발자로서 살아오며, 다른 분들의 지식을 찾아다니기만 했지,  정작 나 스스로 무언가를 정리하거나 공유할 생각을 하지는 못했던 것 같았습니다.  남들 다하는 블로그를 이제 시작하려 하는데, 사실 무엇을 정리해야할지도 잘 모르겠습니다.   다만 나 스스로 조금 더 성장하는 과정의 일부분으로 생각하고 하나 하나 조금씩 정리하려합니다.  모든 포스팅은 제가 아는 범위에서 작성되는 것이고, 따라서 잘못된 부분이 있을 수도 있습니다.  잘못된 부분은 포스팅의 댓글로 알려주시면, 보완하여 수정토록 하겠습니다.  ","categories": ["My Story"],
        "tags": ["My Story"],
        "url": "https://ysjee141.github.io/blog/my%20story/my-story/",
        "teaser": null
      },{
        "title": "BeanDefinitionRegistryPostProcessor의 사용",
        "excerpt":"Spring에서 어플리케이션이 시작될 때 동적으로 Bean을 생성하기 위해서는 다양한 방법이 존재한다. 앞서에는 Application Context 의 Event Listener를 통해 동적 Bean을 생성하는 방법을 소개한 적이 있는데,  이번에는  BeanDefinitionRegistryPostProcessor를 통해 동적 Bean을 생성하는 방법을 정리하려 한다.   좀 더 자세한 이해가 필요하겠지만, 지금까지 내가 이해한 것으로는 Event Listener를 통해 동적 Bean을 생성하는 것과  BeanDefinitionRegistryPostProcessor를 통해 동적 Bean을 생성하는 것의 결정적인 차이는 생성 시점으로 생각된다.   Application Context의 Event는 생성/갱신/중지/종료 시점에 동작을 하게된다. 반면에 BeanDefinitionRegistryPostProcessor는 Spring이 Component Scan을 하기 이전 또는  실행하면서 발생하는 것이 아닌가 싶다. 이 부분은 자세한 조사를 통해 다시 정리토록 하겠다.   Code Sample   본 포스트의 주 목적은 ‘BeanDefinitionRegistryPostProcessor’의 사용이므로, 이 부분에 집중하기로 하자. 아래 예제를 참고하자   public class PostProcessor implements BeanDefinitionRegistryPostProcessor { \t@Override \tpublic void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry beanFactory) throws BeansException { \t\t... \t}  \t@Override \tpublic void postProcessBeanFactory(ConfigurableListableBeanFactory configurableListableBeanFactory) throws BeansException {         ... \t} }  BeanDefinitionRegistryPostProcessor를 사용하기 위해서는 인터페이스를 통해 구현 클래스를 개발하면 된다.  Override되어야 하는 함수는 다음과 같다.     postProcessBeanDefinitionRegistry(BeanDefinitionRegistry beanFactory): BeanFactory를 이용하여 빈 정보를 등록하는 경우 이용   postProcessBeanFactory(ConfigurableListableBeanFactory configurableListableBeanFactory): BeanDefinitionRegistry를 이용하여 빈 정보를 등록하는 경우 이용   정리   나의 경우에는 Dynamic Mapper를 구현하는 과정에서 @MapperScan Annotation이 없이  Custom Annotation을 통해 Mapper Class 들을 Bean으로 등록하여 사용하고자 하는 것이 목적이였다. 그런데 Application Context Event를 통해 이를 구현하였더니, ContextRefreshedEvent는  이미 Autowired Bean의 등록 및 스캔이 완료된 시점에서 호출이 되는지 @MapperScan이 누락이 되면  Autowired 설정한 Class를 찾지 못해 오류가 발생하였다.   이러한 상황을 BeanDefinitionRegistryPostProcessor를 통해 구현했더니, 위 문제가 해결되었다.   Spring에서 Bean이 등록되고 동작되는 방식에 대한 자세한 학습이 필요할 듯하다…  ","categories": ["Server-Side"],
        "tags": ["SpringBoot"],
        "url": "https://ysjee141.github.io/blog/server-side/BeanDefinitionPostProcessor/",
        "teaser": null
      }]
