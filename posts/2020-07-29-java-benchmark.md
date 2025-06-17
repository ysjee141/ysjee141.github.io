---
title: JMH(Java Microbenchmark Harness) 사용법
category: Quality
tags: [Java, Benchmark, JMH, Performance]
refs: 
    - https://medium.com/@devAsterisk/jmh-java-benchmark-tool-4f7a27eb3fa3
    - http://tutorials.jenkov.com/java-performance/jmh.html#state-scope
---

개발을 진행하다가 보면, 성능문제를 해결해야 하는 경우는 매우 많다. 성능 문제를 해결하기 위해서는 우선 성능을 측정해야하며, 성능을 측정하는 방법와 도구는 셀수도 없이 많다.<br>
대부분의 경우 개발환경 또는 운영환경에 어플리케이션이 배포가 되고, Stress Test를 진행하여 성능을 측정한다.<br>
이러한 방법은 매우 일반적이며 어플리케이션의 성능을 개선하기 위해서는 당연히 수행해야 하는 작업이다.

이러한 성능 도구는 어플리케이션의 기능 수행 측면에서의 성능 측정이고, 
일부 로직에 대한 성능을 측정하고 비교하기에는 무거운 감이 없지 않다.<br>
개발을 하다보면, 특정 코드에 대한 간단한 비교가 필요하기도 하고, 학습을 위해 각 코드에 대한 
성능을 비교해야 할 경우도 많이 있을 것이다. 이렇듯 코드에 대한 성능측정을 하기 위한 방법을 찾던 중 
JMH(Java Microbenchmark Harness)란 도구를 알게 되어 사용법을 정리해 본다.

참고로, JMH는 Oracle의 JIT Compiler 개발자가 만든 것이기 때문에 
타 Benchmark Framework 보다 신뢰할 수 있다는 장점이 존재한다.

## Maven 프로젝트 생성 및 Dependency 설정

JMH를 통해 벤치마킹 테스트를 하기 위해서는 Project를 생성해야 한다. 만약, 이미 만들어진 프로젝트에 
JMH을 사용하려면 Maven Dependency를 추가하면 된다.

**Maven Project 생성**
```bash
$ mvn archetype:generate \
    -DinteractiveMode=false \ 
    -DarchetypeGroupId=org.openjdk.jmh \ 
    -DarchetypeArtifactId=jmh-java-benchmark-archetype \ 
    -DgroupId=com.happl.test \
    -DartifactId=code-benchmark \
    -Dversion=1
```
**Maven Dependency**
```xml
  <dependency>
    <groupId>org.openjdk.jmh</groupId>
    <artifactId>jmh-core</artifactId>
    <version>1.19</version>
  </dependency>
  <dependency>
    <groupId>org.openjdk.jmh</groupId>
    <artifactId>jmh-generator-annprocess</artifactId>
    <version>1.19</version>
  </dependency>
```

## JMH를 통한 Benchmark 테스트

성능 측정을 위해서는 JMH에서 지원하는 Annotation을 사용하여 코드를 작성하면 된다. 예제는 아래와 같다.<br>
ArrayList에 데이터를 넣은 후 반복문을 돌리는 테스트 코드이다.
```java
@State(Scope.Thread)
@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.MILLISECONDS)
public class LoopTest {

    final LIMIT_COUNT = 10000;
    final List<Integer> array = new ArrayList<>();

	@Setup
	public void init() {
        // 성능 측정 전 사전에 필요한 작업
        for(int i = 0; i < LIMIT_COUNT; i++) {
            array.add(i);
        }
	}

	@Benchmark
	public void originLoopWithGetSize() {
        // 성능을 측정할 코드 작성
        int size = array.size();
        for(int i = 0; i < size; i++) {
            processor(i);
        }
	}

    Integer temp = 0;
    public void processor(Integer i) {
        temp = i;
    }

    public static void main(String[] args) throws IOException, RunnerException {
        Options opt = new OptionsBuilder()
                .include(LoopTest.class.getSimpleName())
                .warmupIterations(10)           // 사전 테스트 횟수
                .measurementIterations(10)      // 실제 측정 횟수
                .forks(1)                       // 
                .build();
        new Runner(opt).run();                  // 벤치마킹 시작
    }
}
``` 
SELECT CODE
FROM TBL_CODE
GROUP BY CODE



측정이 완료되면 다음과 같은 결과가 출력된다.
```bash
# Run complete. Total time: 00:01:43

Benchmark                       Mode  Cnt  Score   Error  Units
LoopTest.forEach                avgt   10  0.990 ± 0.096  ms/op
LoopTest.forEachByJdk8          avgt   10  0.703 ± 0.160  ms/op
LoopTest.forEachByStream        avgt   10  0.561 ± 0.057  ms/op
LoopTest.originLoop             avgt   10  0.634 ± 0.117  ms/op
LoopTest.originLoopWithGetSize  avgt   10  0.876 ± 0.093  ms/op
```

## Annotation 정리

### @BenchmarkMode
JMH는 벤치마크를 다양항 방법을 수행할 수 있으며, 이를 지정하기 위해 @BenchmarkMode를 사용한다. <br>
사용가능한 방법은 아래 참조

| Mode | Description |
| --- | --- |
| Throughput | 초당 작업수 측정, 기본값 |
| AverageTime | 작업이 수행되는 평균 시간을 측정 |
| SampleTime | 최대, 최소 시간 등 작업이 수행하는데 걸리는 시간을 측정
| SingleShotTime | 단일 작업 수행 소요 시간 측정, Cold Start(JVM 예열 없이) 수행하는데 적격 |
| All | 위 모든 시간을 측정 |

**예제 코드([http://tutorials.jenkov.com/java-performance/jmh.html](http://tutorials.jenkov.com/java-performance/jmh.html))**

```java
public class MyBenchmark {

    @Benchmark @BenchmarkMode(Mode.Throughput)
    public void testMethod() {
        // This is a demo/sample template for building your JMH benchmarks. Edit as needed.
        // Put your benchmark code here.

        int a = 1;
        int b = 2;
        int sum = a + b;
    }

}
```

### @OutputTimeUnit

벤치마크 결과를 출력할 시간 단위를 설정할 수 있으며, java.util.concurrent.TimeUnit 열거형을 통해 설정이 가능하다.

* NANOSECONDS(Default)
* MICROSECONDS
* MILLISECONDS
* SECONDS
* MINUTES
* HOURS
* DAYS

**예제 코드([http://tutorials.jenkov.com/java-performance/jmh.html](http://tutorials.jenkov.com/java-performance/jmh.html))**

```java
public class MyBenchmark {

    @Benchmark @BenchmarkMode(Mode.Throughput) @OutputTimeUnit(TimeUnit.MINUTES)
    public void testMethod() {
        // This is a demo/sample template for building your JMH benchmarks. Edit as needed.
        // Put your benchmark code here.

        int a = 1;
        int b = 2;
        int sum = a + b;
    }

}
```

### @State

JMH는 벤치마크에 사용되어지는 Argument의 상태를 지정할 수 있다. 벤치마크 테스트를 진행하다보면 상황에 따라
Argument가 항상 초기화 되어야 할 때도 있고, 값이 항상 유지되어야 할 경우도 있을텐데 이것을 가능하게 하는 것이
@State Annotation이며, 정의 가능한 Scope는 아래와 같다. 

| Scope | Description |
| --- | --- |
| Thread | Thread별로 인스턴스 생성 |
| Benchmark | 동일 테스트 내 모든 Thread에서 동일 Instance를 공유 (Multi-Threading 테스트) |
| Group | Thread 그룹마다 Instance를 생성 |

> @Steate Annotation이 적용되는 클래스는 다음과 같은 규칙을 준수해야 한다.
>* 반드시 Public 클래스로 선언되어야 한다. 만약 중첩 클래스인 경우에는 static로 선언되어야 한다.
>* Argument가 없는 생성자가 반드시 있어야 한다.
> 위 규칙을 준수하면 @State Annotation을 클래스에 적용하여 JMH가 인식하도록 할 수 있다.

**예제 코드([http://tutorials.jenkov.com/java-performance/jmh.html](http://tutorials.jenkov.com/java-performance/jmh.html))**

```java
public class MyBenchmark {

    @State(Scope.Thread)
    public static class MyState {
        public int a = 1;
        public int b = 2;
        public int sum ;
    }


    @Benchmark @BenchmarkMode(Mode.Throughput) @OutputTimeUnit(TimeUnit.MINUTES)
    public void testMethod(MyState state) {
        state.sum = state.a + state.b;
    }

}
```

### @Setup / @TearDown

@Setup 및 @TearDown Annotation은 상태 클래스의 Method에 적용이 가능하다. @Setup Annotation은 JMH에게 
벤치마크가 시작되기 전 상태 Object를 설정하기 위해 사용한다. JUnit의 @Before와 같은 역할을 한다고 이해하면 쉽다.
@TearDown Annotation은 벤치마크가 종료된 이후 상태 Object를 정리하기 위해 사용한다. JUnit의 @After와 같은 역할을 한다고 이해하자.<br>
@Setup / @TearDown이 적용된 Method의 실행시간은 벤치마크 시간에 포함되지 않는다.

@Setup / @TearDown은 Level Arugement의 설정이 가능하며 설정 가능한 값은 다음과 같다.

| Level | Description |
| --- | --- |
| Trial | 벤치마크를 실행할 때 마다 한번씩 호출하며, 실행은 전체 Fork를 의미한다. |
| Iteration | 벤치마크를 반복 할 때마다 한번씩 호출 |
| Invocation | 벤치마크를 메소드를 호출 할 때마다 호출 |

**예제 코드([http://tutorials.jenkov.com/java-performance/jmh.html](http://tutorials.jenkov.com/java-performance/jmh.html))**

```java
public class MyBenchmark {

    @State(Scope.Thread)
    public static class MyState {

        @Setup(Level.Trial)
        public void doSetup() {
            sum = 0;
            System.out.println("Do Setup");
        }

        @TearDown(Level.Trial)
        public void doTearDown() {
            System.out.println("Do TearDown");
        }

        public int a = 1;
        public int b = 2;
        public int sum ;
    }

    @Benchmark @BenchmarkMode(Mode.Throughput) @OutputTimeUnit(TimeUnit.MINUTES)
    public void testMethod(MyState state) {
        state.sum = state.a + state.b;
    }
}
```

### Dead Code를 주의하라

JVM의 경우 Method 등에서 계산된 결과를 반환하거나, 사용되지 않으면 사용하지 않는 코드라고 인식,
해당 코드를 제가하는 경우가 있으며, 이를 Dead Code라 한다. 이러한 코드를 벤치마킹시 
정확한 벤치마킹이 되지 않을 수 있으니 반드시 Dead Code를 작성하지 않도록 주의하자.

Dead Code의 예제는 아래와 같다.

```java
public class MyBenchmark {

    @Benchmark
    public void testMethod() {
        int a = 1;
        int b = 2;
        int sum = a + b;
    }

}
```

위 코드를 보면 testMethod() 내에서 a + b의 계산이 사용하는 코드가 존재하지 않는다.
이러한 경우 JVM은 해당 코드를 Dead Code라고 인식하고 해당 코드의 값이 사용되지 않기 
때문에 선언한 a와 b의 값 또한 사용되지 않는 것이기 때문에 같이 제거가 된다. 

결국 벤치마크 코드에는 아무런 코드도 존재하지 않는 것이 되며, 테스터가 이러한 부분을 인식하지 못한다면,
굉장히 성능이 좋은 코드라고 오해할 소지가 충분하다. 하지만 정작 벤치마크는 실행되지 않은 것과 같다.

이러한 Dead Code를 회피하기 위해서는 아래와 같은 방법을 사용하는 것이 좋다.
* Method가 결과 값을 Return 하도록 작성하라.
* 계산된 값을 JMH가 제공하는 "Black Hole" 함수를 통해 전달한다.

#### JMH가 제공하는 "Black Hole" 사용법 

JMH는 벤치마크 코드에서 계산된 값을 반환하지 않아도 JVM에서 마치 사용하는 것처럼 인식하게 하는 
Blackhole 방법을 제공하며, 예제는 다음과 같다.

```java
public class MyBenchmark {

    @Benchmark
   public void testMethod(Blackhole blackhole) {
        int a = 1;
        int b = 2;
        int sum = a + b;
        blackhole.consume(sum);
    }
}
```

위 코드에서 보면 벤치마크 Method 내 `blockhole.consume(sum)` 코드를 확인할 수 있다. Method에 
JMH가 제공하는 Blackhole 클래스를 Argument로 받고 해당 코드를 수행하면, Method 내에서 계산된 값을
넘겨주면 JVM에서는 계산된 값을 사용한 것으로 인식하여 정확한 측정이 가능하다. method 내 여러개의 계산된 값이
도출된다면 지속적으로 `consume()`를 호출하여 값을 전달하면 된다.

## 정리

JMH는 특정 클래스 또는 코드에 대한 벤치마크 테스트를 진행하는 것에 매우 좋은 방법으로 생각된다. 다만, 
테스트해야 할 범위가 크거나 다양한 Action 또는 Step이 필요한 경우에는 적절한 방법은 아닌 것으로 보여지며, 
이러한 경우에는 APM과 같은 어플리케이션 성능 테스트 솔루션을 활용하는 것이 좋을 것 같다.<br>
JUnit과 JMH를 조합하여, 코드를 빌드하는 과정에서 사전 테스트를 한다면 좀더 나은 코드 품질을 확보할 수 있지 않을까 생각해본다.