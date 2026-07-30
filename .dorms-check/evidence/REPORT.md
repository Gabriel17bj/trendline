# dorms-check 점검 리포트

- 앱: 고교 데이터 추세선 분석기
- 주소: https://ais-pre-kpk5nbmblx3oualtipeewt-962247545765.asia-east1.run.app 
- 스택: Vite
- 점검 트랙: security, edzip

> 이 리포트는 dorms-check(코치)의 자체 점검 결과입니다. 최종 인증마크는 도름스 서버가 스스로 다시 검증해 발급하며, 이 리포트의 통과가 마크를 보장하지 않습니다.

## 보안 검토
- 점수: 100/100 (A+)
- 마크 자격(critical/high 0): 충족

### 통과 항목(증빙)
- [v] 하드코딩 시크릿 — 하드코딩 시크릿 미검출
- [v] 클라이언트 시크릿 노출 — 클라 시크릿 노출 미검출
- [v] 헤더 설정 위치 — server.ts 파일의 Express 미들웨어에서 Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy 보안 헤더를 모든 응답에 적용함.
- [v] 위험 코드 패턴(검토 후보) — 위험 코드 패턴 미검출

## 학운위 심사 준비(에듀집 필수기준)
- 준비 상태: 미충족
- 개인정보처리방침 공개: 없음

> "학운위 심사 준비 완료"는 학교 심의에 낼 서류가 갖춰졌다는 뜻이며, 심의 통과를 보장하지 않습니다. 심의와 최종 결정은 각 학교가 합니다.
