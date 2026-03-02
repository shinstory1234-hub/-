#!/usr/bin/env bash
set -e

if ! command -v python >/dev/null 2>&1; then
  echo "[오류] python 명령어를 찾지 못했습니다. Python 3.10+ 설치 후 다시 실행하세요."
  exit 1
fi

if [ ! -d ".venv" ]; then
  echo "[1/3] 가상환경 생성 중..."
  python -m venv .venv
fi

echo "[2/3] 가상환경 활성화 + 패키지 설치 중..."
# shellcheck disable=SC1091
source .venv/bin/activate
pip install -r requirements.txt

echo "[3/3] 서버 실행 중..."
echo "브라우저에서 http://localhost:5000 열어주세요"
python app.py
