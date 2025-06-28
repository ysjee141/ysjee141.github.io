---
title: Cache-Control에 대하여
date: "2020-12-10"
category: HTTP
tags: [HTTP, Cache]
refs:
    - https://www.huskyhoochu.com/cache-control/
    - https://developer.mozilla.org/ko/docs/Web/HTTP/Headers/Cache-Control
    
---

어플리케이션을 개발하다보면 성능이 중요한 경우가 많다. 성능을 개선하기 위해서는 다양한 방법이 존재하는데,
그 중 가장 쉽게 적용할 수 있으며, 효율이 높은 방법 중에 하나는 캐시(Cache)일 것이다.

다양한 캐시 적용법이 있지만, 본 포스트에서는 클라이언트 브라우저에 대한 캐시 이야기를 해보려 한다.

HTTP Header 중에는 [Cache-Control](https://developer.mozilla.org/ko/docs/Web/HTTP/Headers/Cache-Control) 이라는 것이 있다.
MDN의 Cache-Control Guide에는 다음과 같이 정의 되어 있다.
> The Cache-Control HTTP header holds directives (instructions) for caching in both requests and responses. A given directive in a request does not mean the same directive should be in the response.
>
> 'Cache-Control' HTTP 헤더는 요청과 응답 모두에게 캐싱하기 위한 지시문을 의미합니다. 요청에 지정된 지시문이 응답에 동일한 지시문이 있어야 함을 의미하지는 않습니다.

이를 보면 Cache-Control을 통한 브라우저에 대한 캐시를 적용할 수 있다고 볼 수 있으며, 요청에 대해서는 별도의 처리가 불필요하기 때문에,
응답 측면에서만 적용하는 것으로 Cache를 적용할 수 있다는 의미가 된다. 즉, 사용자(또는 클라이언트) 입장에서는 별도의 처리가 불필요하고,
서비스를 제공하는 측면에서 Cache를 적용함으로써 사용자에게 체감적 성능을 향상 시킬 수 있다고 생각된다.

Cache-Control은 HTTP/1.1에서 추가된 기능으로, 다양한 캐시 정책을 제공하고 있고 여기에서는 자주 사용되는 정책들에 대해 정리한다.
자세한 내용은 [MDN | HTTP - Cache-Control](https://developer.mozilla.org/ko/docs/Web/HTTP/Headers/Cache-Control) 에서 확인이 가능하다.

## Syntax

### Request
```
Cache-Control: max-age=<seconds>
Cache-Control: max-stale[=<seconds>]
Cache-Control: min-fresh=<seconds>
Cache-control: no-cache 
Cache-control: no-store
Cache-control: no-transform
Cache-control: only-if-cached
```
요청시 Cache-Control을 많이 사용하는 것 중의 하나가 `no-cache` 일 수 있다. 
HTML 또는 유사 문법을 통해 페이지를 작성시 아래와 같은 코드를 작성하는 경우가 종종 있다.
```html
<META http-equiv="Cache-Control" content="No-Cache">
```
위 문법은 브라우저가 서버로 페이지를 호출할 경우 Cache를 사용하지 않겠다는 것을 정의하고 호출을 한다는 의미이다.
이는 위에 Request 문법에도 표시가 되어 있는데, no-cache, no-store 모두 동일한 결과를 보여주지만, 내부 동작 방식이 다르다.

* no-cache는 캐시를 저장은 하지만, 캐시가 매번 유효한지 서버에 질의를 하는 것이다.
* no-store는 캐시 자체를 저장하지 않는 것이다.


### Response
```
Cache-control: must-revalidate
Cache-control: no-cache
Cache-control: no-store
Cache-control: no-transform
Cache-control: public
Cache-control: private
Cache-control: proxy-revalidate
Cache-Control: max-age=<seconds>
Cache-control: s-maxage=<seconds>
```