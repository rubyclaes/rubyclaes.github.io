#!/usr/bin/env python3
"""Local content studio: serve the site and write content.js on Save."""

from __future__ import annotations

import json
import re
import socket
import sys
import time
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

ROOT = Path(__file__).resolve().parent.parent
MAX_BODY = 2 * 1024 * 1024
MAX_IMAGE = 15 * 1024 * 1024
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
STAMP_RE = re.compile(r"(content\.js\?v=)[^\"'&\s]+")
HTML_FILES = ("index.html", "cv.html", "editor.html")
START_PORT = 4173


def parse_project(raw):
    try:
        number = int(raw)
    except (TypeError, ValueError):
        return None
    if number < 1 or number > 99:
        return None
    return number


def portfolio_dir(number):
    return ROOT / "images" / "portfolio" / str(number)


def list_project_images(number):
    """Return every image in images/portfolio/{number}/.

    Folder numbers are stable drawers (project 4 stays in 4/ if the card
    is moved). The editor pairs name.en.jpg with name.de.jpg by stem.
    """
    folder = portfolio_dir(number)
    if not folder.is_dir():
        return []
    names = [
        path.name
        for path in folder.iterdir()
        if path.is_file() and path.suffix.lower() in IMAGE_EXTS
    ]
    names.sort(key=lambda name: name.lower())
    return ["images/portfolio/%s/%s" % (number, name) for name in names]


def all_project_images():
    root = ROOT / "images" / "portfolio"
    result = {}
    if not root.is_dir():
        return result
    for child in root.iterdir():
        if child.is_dir() and child.name.isdigit():
            result[child.name] = list_project_images(int(child.name))
    return result


def safe_upload_name(name):
    base = Path(unquote(name or "")).name
    ext = Path(base).suffix.lower()
    if ext not in IMAGE_EXTS:
        return None
    stem = Path(base).stem
    stem = re.sub(r"[^\w.\-]+", "-", stem, flags=re.UNICODE).strip(".-") or "image"
    return stem + ext


def unique_path(folder, filename):
    dest = folder / filename
    if not dest.exists():
        return dest
    stem = dest.stem
    ext = dest.suffix
    index = 2
    while True:
        candidate = folder / ("%s-%s%s" % (stem, index, ext))
        if not candidate.exists():
            return candidate
        index += 1


def query_value(parsed, key):
    values = parse_qs(parsed.query).get(key) or []
    return values[0] if values else ""


def resolved_image(number, filename):
    name = Path(unquote(filename or "")).name
    if not name or name in (".", ".."):
        return None
    folder = portfolio_dir(number).resolve()
    dest = (folder / name).resolve()
    try:
        dest.relative_to(folder)
    except ValueError:
        return None
    if dest.suffix.lower() not in IMAGE_EXTS:
        return None
    return dest


def pick_port(start: int = START_PORT) -> int:
    for port in range(start, start + 20):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                sock.bind(("127.0.0.1", port))
            except OSError:
                continue
            return port
    sys.exit("Could not find a free port. Close other content studio windows and try again.")


def bump_content_cache() -> str:
    stamp = time.strftime("%Y%m%d-%H%M")
    for name in HTML_FILES:
        path = ROOT / name
        original = path.read_bytes().decode("utf-8")
        updated = STAMP_RE.sub("content.js?v=" + stamp, original)
        if updated != original:
            write_bytes_retry(path, updated.encode("utf-8"))
    return stamp


def write_bytes_retry(path: Path, data: bytes, attempts: int = 6) -> None:
    last = None
    for i in range(attempts):
        try:
            path.write_bytes(data)
            return
        except OSError as error:
            last = error
            time.sleep(0.15 * (i + 1))
    raise last


class StudioHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, format, *args):
        sys.stdout.write("[%s] %s\n" % (self.log_date_time_string(), format % args))
        sys.stdout.flush()

    def handle_one_request(self):
        try:
            super().handle_one_request()
        except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError, TimeoutError):
            pass

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        super().end_headers()

    def send_json(self, code: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path in ("/", ""):
            self.send_response(302)
            self.send_header("Location", "/editor.html")
            self.end_headers()
            return
        if parsed.path == "/studio/images":
            self.send_json(200, {"ok": True, "projects": all_project_images()})
            return
        if "/." in parsed.path:
            self.send_error(404)
            return
        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/save-content":
            self.save_content()
            return
        if parsed.path == "/studio/image":
            self.save_image(parsed)
            return
        self.send_error(404)

    def do_DELETE(self):
        parsed = urlparse(self.path)
        if parsed.path != "/studio/image":
            self.send_error(404)
            return
        number = parse_project(query_value(parsed, "project"))
        dest = resolved_image(number, query_value(parsed, "name")) if number else None
        if dest is None:
            self.send_json(400, {"ok": False, "error": "That photo could not be found."})
            return
        if dest.is_file():
            dest.unlink()
            print("Removed %s" % dest.relative_to(ROOT), flush=True)
        self.send_json(200, {"ok": True})

    def save_content(self):
        try:
            length = int(self.headers.get("Content-Length") or "0")
            if length <= 0 or length > MAX_BODY:
                self.send_json(400, {"ok": False, "error": "The file was empty or too large to save."})
                return
            text = self.rfile.read(length).decode("utf-8")
            if "const SITE" not in text or "const CONTENT" not in text:
                self.send_json(400, {"ok": False, "error": "That did not look like content.js."})
                return
            if not text.endswith("\n"):
                text += "\n"
            write_bytes_retry(ROOT / "content.js", text.encode("utf-8"))
            stamp = bump_content_cache()
            print("Saved content.js (cache %s)" % stamp, flush=True)
            self.send_json(200, {"ok": True, "version": stamp})
        except Exception as error:
            print("Save failed: %s" % error, flush=True)
            try:
                self.send_json(500, {
                    "ok": False,
                    "error": "Could not write content.js. Keep the studio window open and try Save again."
                })
            except Exception:
                pass

    def save_image(self, parsed):
        number = parse_project(query_value(parsed, "project"))
        filename = safe_upload_name(query_value(parsed, "name"))
        length = int(self.headers.get("Content-Length") or "0")
        if not number or not filename:
            self.send_json(400, {"ok": False, "error": "Use a JPG, PNG or WebP photo."})
            return
        if length <= 0 or length > MAX_IMAGE:
            self.send_json(400, {"ok": False, "error": "That photo was empty or too large (15 MB max)."})
            return
        folder = portfolio_dir(number)
        folder.mkdir(parents=True, exist_ok=True)
        dest = unique_path(folder, filename)
        dest.write_bytes(self.rfile.read(length))
        rel = "images/portfolio/%s/%s" % (number, dest.name)
        print("Added %s" % rel, flush=True)
        self.send_json(200, {"ok": True, "path": rel})


def main() -> None:
    if not (ROOT / "editor.html").is_file() or not (ROOT / "content.js").is_file():
        sys.exit("Run this from the website folder (the one that contains editor.html).")
    port = pick_port()
    url = "http://127.0.0.1:%s/editor.html" % port
    server = ThreadingHTTPServer(("127.0.0.1", port), StudioHandler)
    print("", flush=True)
    print("Content studio is running.", flush=True)
    print("Keep this window open while you edit.", flush=True)
    print("", flush=True)
    print("  Edit:    %s" % url, flush=True)
    print("  Preview: http://127.0.0.1:%s/index.html" % port, flush=True)
    print("", flush=True)
    print("Press Ctrl+C to stop.", flush=True)
    print("", flush=True)
    if "--no-browser" not in sys.argv:
        try:
            webbrowser.open(url)
        except Exception:
            print("Open this address in your browser: %s" % url, flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.", flush=True)
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
