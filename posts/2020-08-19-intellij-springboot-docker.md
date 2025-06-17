---
title: Spring Boot를 Docker 환경으로 개발/디버깅 하기
category: Dev Tools
tags: [SpringBoot, IntelliJ, Devtools, Docker]
refs:
    - https://medium.com/@gaemi/spring-boot-%EA%B3%BC-docker-with-jib-657d32a6b1f0
    - https://imasoftwareengineer.tistory.com/40
---

Spring Boot를 Docker 환경에서 개발 및 디버깅을 하기 위한 방법을 정리한다.

### Dockerfile 만들기
```dockerfile
FROM openjdk:13-jdk  # 기본 이미지

LABEL maintainer="jiys@tidesquare.com"

VOLUME /tmp # 데이터 보존을 위한 Volume 마운트

EXPOSE 8080 5005 외부에 노출할 포트

ARG JAR_FILE=target/batch-0.0.1-SNAPSHOT.jar 

ADD ${JAR_FILE} batch.jar

# 실행 명령
ENTRYPOINT ["java","-Djava.security.egd", "-Xdebug","-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005","-jar","/batch.jar"]
```

docker 파일의 핵심은 빌드된 jar 파일을 docker container로 복사 후 실행시키는 것이다.
Spring Boot의 경우 Embedded 된 WAS를 통한 단독 실행이 가능하기 때문에 빌드된 jar 파일의 복사 만으로 
docker 이미지를 구성할 수 있어 편리하다.

ENTRYPOINT는 사전 작업이 완료된 이후 docker에서 실행되어야 할 명령어를 정의한다.<br/>
Spring Boot의 빌드 결과물인 bootJar 파일의 경우 java -jar xxxx.jar 로 실행이 가능하지만, 원격으로 디버깅을 같이 하기 위해서는
아래와 같이 추가 옵션이 필요하다. <br/>
`"-Xdebug","-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"` <br/>
반드 이 옵션이 포함되어야 원격 디버깅이 가능하며, address 항목의 포트는 필요에 따라 변경하면 된다.

**반드시 유의할 점은 위 dockerfile은 빌드된 jar 파일을 가져오는 것이므로, docker 빌드 전 반드시 
Spring Boot Application의 빌드가 선행되어야 한다는 점이다.**

dockerfile의 적싱이 완료되면 docker를 빌드한다.
```bash
$ docker build --tag example .
```

IntelliJ에서 Docker 빌드 및 배포를 실행할 수도 있으며, Run/Debug Configurations에 Dockerfile 프로필을 생성하고,
아래 이미지와 같이 설정한다. 참고로 나는 Docker 빌드 전 Spring Boot Application 빌드를 사전작업으로 지정해 놓았다.
![](../assets/post_img/1378050939966400.png)

### Spring Boot Dev Tools를 통한 Hot Reload 설정
위와 같이 Docker로 Application을 배포하게 되면 문제점이 디버깅과 디버깅 과정에서 수정된 코드의 즉시 반영이 되지 않는다는
점이다. Spring Boot는 이러한 문제의 해결을 위한 아주 간편한 방법을 제공하는데 그것이 바로 Dev Tools이다.
Docker 환경이 아닌 경우에 Dev Tools는 변경된 Application의 내용을 즉시 반영하고, 서비스를 자동 재시작해주는 역할을 하는데,
이는 Docker 환경에서도 동일하게 동작을 한다. 하지만 추가적인 설정이 필요하다.
application.yml 파일에 아래와 같은 코드를 추가한 후 Application을 Docker로 배포한다.
```yaml
spring:
  devtools:
    remote:
      secret: mysecret
``` 

Dev Tools는 지정된 secret key를 통해 Application을 인식하고, Local 실행과 동일하게 변경점의 즉시 반영 및 자동 재시작을 지원해준다.
단, 이는 Docker Container에 배포 후 원격 디버깅을 설정해야만 한다. 이를 위해 dockerfile에서 추가 옵션을 지정한 것이다.
IntelliJ에서의 Spring Boot 원격 디버깅은 아래 이미지와 같이 설정한다.
![](../assets/post_img/1378444679106800.png)

이곳에서의 핵심은 Main class이다. 일반적으로 IntelliJ에서 Spring Boot Application을 개발시 실행 프로필의 Main class는
@SpringBootApplication 어노테이션이 붙은 클래스이지만, Dev Tools를 통한 원격 디버깅을 하기 위해서는 `org.springframework.boot.devtools.RemoteSpringApplication`
클래스를 지정해야만한다. 다만, RemoteSpringApplication 클래스는 자동으로 검색이 되지 않으니 직접 입력을 해주어야만 한다.
또한, Program arguments에 배포된 container에 접근할 수 있는 URL이 지정되어야 한다. 
이와 같은 설정 후 실행하면 Dev Tools가 Docker에 배포된 Application과 연결후 Application 수정에 따른 변경점 배포 및 자동 재시작을
지원해주어 Local 개발시와 동일하게 개발이 가능하다.

지금까지 Docker 환경에서 Spring Boot Application 개발을 위한 환경 설정을 정리해 보았다. 다만, Application의 부피가 커지는 것을 감안했을 경우
Dockerfile의 Layer를 구분하는 것이나, Maven 또는 Gradle을 통한 자동 배포 설정 같은 것이 필요할 것으로 보여진다.
이러한 부분은 추가적으로 정리해보자.