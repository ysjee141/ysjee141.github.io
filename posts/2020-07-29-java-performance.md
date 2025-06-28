---
title: 성능을 생각하는 Java 코딩법
date: "2020-07-29"
category: Quality
tags: Java
published: false
---

어플리케이션을 개발하다보면 성능이 중요해 지는 순간이 종종 찾아오고, 성능이 저하되는 이유는 무수히 많다.

## 반복문 성능

### Benchmark 코드
```java
@State(Scope.Thread)
@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.MILLISECONDS)
public class LoopTest {

	final int LOOP_LIMIT = 100000;
	List<Integer> array = new ArrayList<>();

	@Setup
	public void init() {
		for(int loop = 0; loop < LOOP_LIMIT; loop++) {
			array.add(loop);
		}
	}

	@Benchmark
	public void originLoopWithGetSize() {
		for (int loop = 0; loop < array.size(); loop++) {
			process(array.get(loop));
		}
	}

	@Benchmark
	public void originLoop() {
		int listSize = array.size();
		for (int loop = 0; loop < listSize; loop++) {
			process(array.get(loop));
		}
	}

	@Benchmark
	public void forEach() {
		int listSize = array.size();
		for( Integer x: array ) {
			process(x);
		}
	}

	@Benchmark
	public void forEachByJdk8() {
		array.forEach(x -> process(x));
	}

	@Benchmark
	public void forEachByStream() {
		array.stream().forEach(x -> process(x));
	}

	private int temp = 0;
	public void process(int a) {
		temp+=a;
	}
}

```