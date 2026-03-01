import os
import sqlite3
from datetime import datetime
from functools import wraps
from pathlib import Path
from uuid import uuid4

from flask import (
    Flask,
    flash,
    g,
    redirect,
    render_template,
    request,
    send_from_directory,
    session,
    url_for,
)
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
DATABASE_PATH = BASE_DIR / "blog.db"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-me")
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # 5MB


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(_error):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = get_db()
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            image_name TEXT,
            created_at TEXT NOT NULL,
            author_id INTEGER NOT NULL,
            FOREIGN KEY (author_id) REFERENCES users(id)
        );
        """
    )
    db.commit()


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def login_required(view_func):
    @wraps(view_func)
    def wrapped(*args, **kwargs):
        if "user_id" not in session:
            flash("먼저 로그인해 주세요.")
            return redirect(url_for("login"))
        return view_func(*args, **kwargs)

    return wrapped


@app.before_request
def load_logged_in_user():
    user_id = session.get("user_id")
    if user_id is None:
        g.user = None
    else:
        g.user = get_db().execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()


@app.route("/")
def index():
    posts = get_db().execute(
        """
        SELECT p.id, p.title, p.content, p.image_name, p.created_at, u.username AS author
        FROM posts p
        JOIN users u ON p.author_id = u.id
        ORDER BY p.id DESC
        """
    ).fetchall()
    return render_template("index.html", posts=posts)


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")

        if not username or not password:
            flash("아이디와 비밀번호를 모두 입력해 주세요.")
            return render_template("register.html")

        db = get_db()
        try:
            db.execute(
                "INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)",
                (username, generate_password_hash(password), datetime.utcnow().isoformat()),
            )
            db.commit()
        except sqlite3.IntegrityError:
            flash("이미 존재하는 아이디입니다.")
            return render_template("register.html")

        flash("회원가입 완료! 이제 로그인해 주세요.")
        return redirect(url_for("login"))

    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")

        user = get_db().execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
        if user is None or not check_password_hash(user["password_hash"], password):
            flash("아이디 또는 비밀번호가 올바르지 않습니다.")
            return render_template("login.html")

        session.clear()
        session["user_id"] = user["id"]
        flash(f"{username}님, 환영합니다!")
        return redirect(url_for("index"))

    return render_template("login.html")


@app.route("/logout")
def logout():
    session.clear()
    flash("로그아웃되었습니다.")
    return redirect(url_for("index"))


@app.route("/write", methods=["GET", "POST"])
@login_required
def write_post():
    if request.method == "POST":
        title = request.form.get("title", "").strip()
        content = request.form.get("content", "").strip()
        image = request.files.get("image")

        if not title or not content:
            flash("제목과 내용을 모두 입력해 주세요.")
            return render_template("write.html")

        image_name = None
        if image and image.filename:
            if not allowed_file(image.filename):
                flash("이미지는 png, jpg, jpeg, gif, webp만 업로드할 수 있습니다.")
                return render_template("write.html")

            ext = image.filename.rsplit(".", 1)[1].lower()
            image_name = f"{uuid4().hex}.{ext}"
            image.save(UPLOAD_DIR / secure_filename(image_name))

        get_db().execute(
            "INSERT INTO posts (title, content, image_name, created_at, author_id) VALUES (?, ?, ?, ?, ?)",
            (title, content, image_name, datetime.utcnow().isoformat(), session["user_id"]),
        )
        get_db().commit()
        flash("글이 등록되었습니다!")
        return redirect(url_for("index"))

    return render_template("write.html")


@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_DIR, filename)


@app.route("/init")
def setup_db():
    init_db()
    return "DB 초기화 완료! /register 로 이동하세요."


if __name__ == "__main__":
    with app.app_context():
        init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)
