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

ROOT = Path(__file__).resolve().parent.parent
MAX_BODY = 2 * 1024 * 1024
STAMP_RE = re.compile(r"(content\.js\?v=)[^\"'&\s]+")
HTML_FILES = ("index.html", "cv.html", "editor.html")
START_PORT = 4173


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
            path.write_bytes(updated.encode("utf-8"))
    return stamp


class StudioHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, format, *args):
        sys.stdout.write("[%s] %s\n" % (self.log_date_time_string(), format % args))
        sys.stdout.flush()

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
        path = self.path.split("?", 1)[0]
        if path in ("/", ""):
            self.send_response(302)
            self.send_header("Location", "/editor.html")
            self.end_headers()
            return
        if "/." in path:
            self.send_error(404)
            return
        super().do_GET()

    def do_POST(self):
        path = self.path.split("?", 1)[0]
        if path != "/save-content":
            self.send_error(404)
            return
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
        (ROOT / "content.js").write_bytes(text.encode("utf-8"))
        stamp = bump_content_cache()
        print("Saved content.js (cache %s)" % stamp, flush=True)
        self.send_json(200, {"ok": True, "version": stamp})


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
