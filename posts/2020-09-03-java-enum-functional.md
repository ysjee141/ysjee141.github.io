---
title: enum 보다 잘 활용하기
date: "2025-06-15"
category: Server-Side 
tags: [Java]
source: https://gist.github.com/ysjee141/70b30b3426fbbf01563dcea45c6dc95e
refs: 
    - https://woowabros.github.io/tools/2017/07/10/java-enum-uses.html
    - http://wiki.sys4u.co.kr/pages/viewpage.action?pageId=7766426
---

개발을 진행하다보면, 정해진 코드 값이나 패턴 등 정형화된 케이스에 대한 처리가 이루어지는 경우가 많다.
이러한 경우 보통 enum을 활용하는데, 이번 포스트는 이번에 알게되었고, 사용한 enum의 활용법에 이야기 해보려 한다.

## enum의 특징

enum을 활용함에 있어 개발상의 이점은 아래와 같이 정리할 수 있다.

* Plain Text와 비교하여, IDE의 적극적 지원이 가능하다. (Class 이기 때문에)
* 특정 값으로 값을 제한할 수 있어, Human Error를 줄일 수 있다.
* 값이 추가되더라도 enum의 추가만으로 처리가 가능하다. 다른 코드의 수정은 불필요하다.
* *JDK 8 이후 Argument로 함수 사용이 가능하여, ENUM 자체로 처리가 가능하다.*

> 여기서 이야기 하려는 부분은 마지막 함수 사용인데, enum의 값을 함수로 만들어 값에 대한 처리를 열거형에 위임하는 방법이다.

## 지금까지 enum을 통한 개발 방법

지금까지 enum을 활용하여 개발할 경우 아래와 같이 개발을 진행했다.

```java
public enum DisplayNameMethod {
    FIRST_LAST_TITLE,
    LAST_FIRST_TITLE,
    TITLE_LAST_FIRST,
    TITLE_FIRST_NAME
}

public class Sample() {
    private String firstName = "gildong";
    private String lastName = "hong";
    private String title = "MR";

    public String getDisplayName(DisplayNameMethod method) {
        String result = "";
        switch(method) {
            case FIRST_LAST_TITLE:
                result = firstName + " " + lastName + "/" + title;
                break;
            case LAST_FIRST_TITLE:
                result = lastName + " " + firstName + "/" + title;
                break;
            case TITLE_LAST_FIRST:
                result = title + "/" + lastName + " " + firstName;
                break;
            case TITLE_FIRST_NAME:
                result = title + "/" + firstName + " " + lastName;
                break;
        }        
        return result;
    }
}
```

위와 같이 개발을 해도 사실 크게 상관은 없다. enum을 통해 이름을 표시하는 패턴을 정의하고, 그에 맞춰 표시만 하면된다.
하지만 위와 같이 개발할 경우 enum이 추가되면, enum을 추가하고 그에 따른 처리를 한는 부분을 찾아서 추가된 enum 값에 대한 처리를 직접 추가 및 수정을 해줘야한다.

## enum의 Function화

이를 개선하기 위한 방법은 enum 값 자체가 일종의 함수 역할을 해주면 보다 간결해질 것이다. 특히 위와 같이 행위의 패턴을 의미하는 enum의 경우 이러한 방식의 개발이 가능하다.
아래의 코드를 살펴보자

```java
public enum NameDisplayMethod {
	FIRST_LAST_TITLE(
			(t, f, l) -> String.format("%s %s/%s", f, l, t)
	),
	LAST_FIRST_TITLE(
			(t, f, l) -> String.format("%s %s/%s", l, f, t)
	),
	TITLE_LAST_FIRST(
			(t, f, l) -> String.format("%s %s/%s", t, l, f)

	),
	TITLE_FIRST_NAME(
			(t, f, l) -> String.format("%s %s/%s", t, f, l)
	);

	private final NameDisplayFunction expression;

	NameDisplayMethod(NameDisplayFunction expression) {
		this.expression = expression;
	}

	public String getDisplayName(String title, String firstName, String lastName) {
		return this.expression.getDisplayName(title, firstName, String lastName);
	}

	@FunctionalInterface
	public interface NameDisplayFunction {
		String getDisplayName(String title, String firstName, String lastName);
	}
}

public class Sample() {
    private String firstName = "gildong";
    private String lastName = "hong";
    private String title = "MR";

    public String getDisplayName(DisplayNameMethod method) {        
        return method.getDisplayName(title, firstName, lastName);
    }
}
```

위 코드를 자세히 살펴보면 다음과 같다.

### Argument로 활용할 Function 정의

```java
@FunctionalInterface
public interface NameDisplayFunction {
    String getDisplayName(String title, String firstName, String lastName);
}
```

FunctionalInterface란 구현해야할 추상 메소드가 하나만 정의된 인터페이스를 가르키며, Java Language Specification에는 아래와 같이 정의되어 있다.
> A functional interface is an interface that has just one abstract method (aside from the methods of Object), and thus represents a single function contract.
> 
> Functional Interface는 (Object 클래스의 메소드를 제외하고) 단 하나의 추상 메소드만을 가진 인터페이스를 의미하며, 그런 이유로 단 하나의 기능적 계약을 표상하게 된다.

이는 개발상의 논리이며, 이를 개발하고 검증하는 것은 개발자가 직업해야하나, JDK 8에서는 @FunctionalInterface Annotation을 제공하여, 인터페이스에 Annotation이 적용되면,
해당 인터페이스가 FunctionalInterface인지를 검증하여 준다.

위와 같은 인터페이스는 다음과 같이 구현될 수 있으며, Lambda의 사용도 가능하다.
```java
// 구현체
public class NameDisplayFunctionImpl implements NameDisplayMethod.NameDisplayFunction {
	@Override
	public String getDisplayName(PassengerInfo value, String delimiter) {
		return null;
	}
}

// Inline 표현식
NameDisplayFunction f = new NameDisplayFunction() {
    @Override
    public String getDisplayName(String title, String firstName, String lastName) {
        return null;
    }
}

// Lambda 표현식
(a, b, c) -> a + b + c
```
Functional Interface의 가장 큰 이점은 Lambda로 사용이 가능하다는 점이다. 때문에, enum의 Argument를 Function으로 구현하여 처리가 가능하다.

### enum의 함수화

위의 Functional Interface를 사용하게 되면 아래의 코드와 같이 enum의 값을 Function으로 구현할 수 있다. 

```java
public enum NameDisplayMethod {
	FIRST_LAST_TITLE(
			(t, f, l) -> String.format("%s %s/%s", f, l, t)
	),
	(...중략...)

	private final NameDisplayFunction expression;

	NameDisplayMethod(NameDisplayFunction expression) {
		this.expression = expression;
	}

	public String getDisplayName(String title, String firstName, String lastName) {
		return this.expression.getDisplayName(title, firstName, String lastName);
	}

	@FunctionalInterface
	public interface NameDisplayFunction {
		String getDisplayName(String title, String firstName, String lastName);
	}
}
```

JDK 7 이하의 경우 다음과 같이 개발이 가능하다.
```java
public enum NameDisplayMethod {
    FIRST_LAST_TITLE {
        String getDisplayName(String title, String firstName, String lastName) {
            return String.format("%s %s/%s", firstName, lastName, title)
        }
    },
    (...중략...)

    abstract String getDisplayName(String title, String firstName, String lastName);
}
```

이렇게 개발이 되면, 아래와 같이 열거형의 사용이 가능하다.
```java
public String getDisplayName(DisplayNameMethod method) {        
    return method.getDisplayName(title, firstName, lastName);
}
```

## 정리

이번 포스트에서 이야기한 내용을 정리하면 다음과 같다.
* enum 항목에 직접 코드를 구현하여, 처리 책임을 enum에 위임할 수 있다.
* FunctionalInterface를 활용하면, enum에 함수를 할당 할 수 있다.
* FunctionalInterface를 활용하면, Lambda의 사용이 가능하다.

하지만 모든 enum의 구현을 위와 같은 방식으로 하는 것은 부적합할 것이다.
enum에 따라 처리되어야 하는 패턴이 일정할 경우에는 매우 효과적일 수 있으나, 
enum 값에 따라 다양한 처리가 이루어지는 경우에는 기존의 방식대로 개발하는 것이 적합할 것이다. 
따라서 enum을 구현하기 전에 적절한 방법을 고민하고, 상황에 맞춰 개발할 것을 추천한다.

