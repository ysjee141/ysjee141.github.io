---
title: Java HashMap 동작 원리
date: "2020-11-10"
category: JDK
tags: [Java]
refs:
    - https://backdoosaan.tistory.com/13
    - https://heepie.me/448
---

Java를 통해 개발을 할 경우 HashMap을 자주 사용하게 된다. 이에 HashMap의 동작 원리 및 Hash 충돌해결에 대해 정리할 에정이다.

## 개념

HashMap은 Key-Value가 1:1로 Mapping 되는 자료구조이며, Mapping으로 인해 삽입, 삭제, 검색이 평균적으로 O(1)인 자료구조이다.
Key는 중복을 허용하지 않지만, Value는 중복을 허용한다.

HashMap의 내부구조는 배열로 되어 있고, Key는 직접 내부 배열의 인덱스가 될 수 있으며, 이를 버킷이라 한다.
인덱스를 구하기 위해서는 해시 함수를 사용하는데 해시 함수는 hashcode() % M 으로 산출할 수 있으나, 동일한 값이 발생할 수 있따.
이를 해시 충돌이라 하며, 이를 방지하기 위한 방법으로 Open Addressing 방식과 Separate Chaning 방식이 있으며, Java의 HashMap의 경우
Separate Chaning 방식을 사용하고 있다.

> Open Addressing: 해시충돌 발생시 인접 인덱스 값을 새로 구해서 해시충돌을 우회
> Separate Chaning: 동일한 해시값이 있을 경우 LinkedList로 관리하고, 8개 이상인 경우 Tree로 변경하여 관리한다.

Hash 함수를 사용할 때 해시 버킷이 적다면 메모리를  절약할 수 있는 반면 해시충돌의 발생 빈도가 높아진다. 따라서 특정 수치가 넘어가면
해시 버킷을 2배로 확장한다. 해시함수를 구할 때 소수(float)로 되어 있다면 충돌 빈도를 낮출 수 있으나 Java의 경우 int로 되어 있
어, 충돌 빈도가 높고 이를 해결하기 위해 보조 해시 함수를 사용하여 해시 값을 변형한다.

## 원리

Java HashMap의 Key는 Object 형을 지원하기 때문에 완전한 해시 함수(perfect hash function)가 아니다.
(hashCode() 결과 자료형은 int - 32비트 정수 자료형으로 2의 32승까지 표현 가능하나, Object의 경우 더 많은 경우의 수를 포함)
아래와 같이 hasing으로 hash 값을 가공한다.
```java
// http://hg.openjdk.java.net/jdk8/jdk8/jdk/file/687fd7c7986d/src/share/classes/java/util/HashMap.java#l336
static final int hash(Object key) {
	int h;
	return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

해시충돌을 해결하기 위해 내부적으로 Node 형의 2차원 배열 Table이 존재한다.
```java
// http://hg.openjdk.java.net/jdk8/jdk8/jdk/file/687fd7c7986d/src/share/classes/java/util/HashMap.java#l395
transient Node<K,V>[] table;
```

Java HashMap의 경우 해시충돌시, Seperate Chainning 방법을 사용하며, 현재 Value의 다음 Value를 연결하는 방식으로 해결한다.
```java
// http://hg.openjdk.java.net/jdk8/jdk8/jdk/file/687fd7c7986d/src/share/classes/java/util/HashMap.java#l641
if (p.hash == hash && ((k = p.key) == key || (key != null && key.equals(k))))
	e = p;
else if (p instanceof TreeNode)
	e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
else {
	for (int binCount = 0; ; ++binCount) {
		if ((e = p.next) == null) {
			p.next = newNode(hash, key, value, null); // 새로운 Node 생성해 연결
			if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
				treeifyBin(tab, hash);
			break;
		}
		if (e.hash == hash && ((k = e.key) == key || (key != null && key.equals(k))))
			break;
		p = e;
	}
}
``` 
위 코드에서 중요한 코도는 `if (binCount >= TREEIFY_THRESHOLD - 1) treeifyBin(tab, hash);`인데,
해시버킷의 개수가 일정 수준을 넘어가게 되면 버킷의 관리를 Tree 형태로 전환하여 관리한다는 것이다. 반대로 버킷의 개수가
일정 수준으로 내려가게 되면 Tree 형태에서 LinkedList 형태로 변경하여 관리한다. 이는 해시충돌의 빈도를 낮추기 위한 조치이며,
메모리를 효율적으로 사용하기 위해서는 버킷의 개수를 사전에 예상할 수 있다면, 변경 기준을 사전에 정의하여 주는 것이 좋다.