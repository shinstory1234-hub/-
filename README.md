# 초보자용 블로그 스타터 (로그인 + 글쓰기 + 이미지 업로드)

코딩을 거의 몰라도 **복붙 + 명령어 몇 개**로 시작할 수 있는 예제입니다.

## 먼저, 질문 답변
**"이걸 어디에 복붙하면 되나요?"**

이 저장소 기준으로는 **복붙할 필요가 없습니다.** 이미 파일이 다 들어있습니다.

- `app.py` : 서버 코드
- `templates/` : 화면 HTML
- `static/style.css` : 디자인
- `requirements.txt` : 필요한 패키지 목록

즉, 지금은 복붙보다 **실행 명령어만 입력**하면 됩니다.

---

## 1) 준비물
- Python 3.10+

## 2) 실행 방법 (그대로 복붙)
터미널에서 프로젝트 폴더로 이동한 뒤 아래 4줄을 그대로 입력하세요.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

브라우저에서 `http://localhost:5000` 접속하면 됩니다.

---

## 3) 처음 사용 순서
1. `/register` 에서 회원가입
2. `/login` 로그인
3. `/write` 에서 글 작성 + 이미지 업로드
4. `/`에서 글 목록 확인

---

## 4) 기능
- 회원가입/로그인/로그아웃
- 블로그 글 발행
- 사진 업로드(png, jpg, jpeg, gif, webp)
- SQLite DB 자동 생성(`blog.db`)

---

## 5) "정말 새로 만들 때" 복붙 위치
만약 다른 컴퓨터에서 0부터 직접 만들고 싶다면 아래처럼 파일을 만드세요.

```text
내폴더/
├─ app.py
├─ requirements.txt
├─ static/
│  └─ style.css
├─ templates/
│  ├─ base.html
│  ├─ index.html
│  ├─ login.html
│  ├─ register.html
│  └─ write.html
└─ uploads/
   └─ .gitkeep
```

각 파일 내용은 이 저장소 파일 내용을 그대로 복사해서 넣으면 됩니다.

---

## 6) 초보자 체크포인트
- `app.py` 하나가 핵심 파일입니다.
- 템플릿은 `templates/` 폴더에 있습니다.
- CSS는 `static/style.css` 입니다.

## 7) 배포(0원)
이 프로젝트는 나중에 Render/Fly.io/Railway 무료 티어로 옮길 수 있습니다.
초보자는 먼저 로컬에서 동작 확인 후 배포하세요.

## 8) 주의
- 실제 운영 전에는 `SECRET_KEY`를 환경변수로 바꾸세요.
- `debug=True`는 개발용입니다.
