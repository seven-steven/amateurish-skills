#!/usr/bin/env python3
"""Token service for the Wechat MP API (wxmp-publisher).

Runs on the whitelisted public server; holds APP_SECRET. See docs/security.md.

Endpoints:
  GET  /health        -> {"ok": true}           (no auth)
  PUT  /publish       -> create draft           (Bearer auth)
  PUT  /publish/img   -> upload body image      (Bearer auth)

Security: bearer auth (constant-time), 12MB body cap, image type/size checks,
in-process sliding-window rate limit. Binds 127.0.0.1 behind a TLS reverse proxy.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import io
import json
import logging
import os
import threading
import time
from collections import defaultdict, deque

import requests
from flask import Flask, jsonify, request
from werkzeug.middleware.proxy_fix import ProxyFix

APP_ID = os.environ["WX_APP_ID"]
APP_SECRET = os.environ["WX_APP_SECRET"]
API_TOKEN = os.environ["WX_TOKEN"]
PORT = int(os.environ.get("PORT", "8787"))
RATE_LIMIT = int(os.environ.get("WX_RATE_LIMIT", "30"))  # req/min per client
RATE_WINDOW = 60.0
MAX_BODY = 12 * 1024 * 1024  # matches MAX_CONTENT_LENGTH
MAX_IMAGE = 10 * 1024 * 1024  # wechat body-image limit
ALLOWED_IMAGE_MIMES = {"image/png", "image/jpeg", "image/gif"}
LOG = logging.getLogger("wxpush")

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_BODY

_token_cache: dict = {"value": None, "expires": 0}
_token_lock = threading.Lock()
_rate_buckets: dict[str, deque[float]] = defaultdict(deque)
_rate_lock = threading.Lock()


def _wx_get(path: str, **params) -> dict:
    r = requests.get(f"https://api.weixin.qq.com{path}", params=params, timeout=15)
    r.raise_for_status()
    data = r.json()
    if data.get("errcode"):
        raise WxError(data["errcode"], data.get("errmsg", ""))
    return data


def _wx_post(path: str, *, files=None, json_body=None) -> dict:
    params = {"access_token": access_token()}
    payload = None
    headers = None
    if json_body is not None:
        # WeChat can display Requests' default ASCII escapes literally in drafts.
        payload = json.dumps(json_body, ensure_ascii=False, allow_nan=False).encode("utf-8")
        headers = {"Content-Type": "application/json; charset=utf-8"}
    r = requests.post(
        f"https://api.weixin.qq.com{path}", params=params,
        files=files, data=payload, headers=headers, timeout=60,
    )
    r.raise_for_status()
    data = r.json()
    if data.get("errcode"):
        raise WxError(data["errcode"], data.get("errmsg", ""))
    return data


class WxError(Exception):
    def __init__(self, code: int, msg: str):
        self.code, self.msg = code, msg
        super().__init__(f"wx err {code}: {msg}")


def access_token() -> str:
    with _token_lock:
        now = time.time()
        if _token_cache["value"] and now < _token_cache["expires"] - 120:
            return _token_cache["value"]
        data = _wx_get(
            "/cgi-bin/token",
            grant_type="client_credential", appid=APP_ID, secret=APP_SECRET,
        )
        _token_cache["value"] = data["access_token"]
        _token_cache["expires"] = now + int(data.get("expires_in", 7200))
        return _token_cache["value"]


def _authed() -> bool:
    auth = request.headers.get("Authorization", "")
    return hmac.compare_digest(auth, f"Bearer {API_TOKEN}")


def _rate_limited() -> bool:
    now = time.monotonic()
    key = request.remote_addr or "?"
    with _rate_lock:
        bucket = _rate_buckets[key]
        while bucket and now - bucket[0] > RATE_WINDOW:
            bucket.popleft()
        if len(bucket) >= RATE_LIMIT:
            return True
        bucket.append(now)
        return False


@app.before_request
def gate():
    if request.path == "/health":
        return None
    if not _authed():
        return jsonify({"error": "unauthorized"}), 401
    if _rate_limited():
        return jsonify({"error": "rate limited"}), 429
    return None


@app.errorhandler(413)
def too_large(e):
    return jsonify({"error": "payload too large"}), 413


@app.get("/health")
def health():
    return jsonify({"ok": True})


@app.errorhandler(WxError)
def wx_error(e: WxError):
    LOG.warning("wx error %s %s", e.code, e.msg)
    return jsonify({"error": f"wx err {e.code}: {e.msg}"}), 502


@app.put("/publish/img")
def publish_img():
    f = request.files.get("image")
    if f is None:
        return jsonify({"error": "missing multipart field: image"}), 400
    mime = (f.mimetype or "").split(";")[0].lower()
    if mime not in ALLOWED_IMAGE_MIMES:
        return jsonify({"error": f"unsupported image type: {mime}"}), 400
    stream = io.BytesIO(f.read())
    if stream.getbuffer().nbytes > MAX_IMAGE:
        return jsonify({"error": "image exceeds 10MB"}), 413
    try:
        data = _wx_post("/cgi-bin/media/uploadimg", files={
            "media": (f.filename or "img.png", stream, mime),
        })
    except requests.RequestException:
        LOG.exception("uploadimg failed")
        return jsonify({"error": "wechat api unreachable"}), 502
    return jsonify({"url": data["url"]})


@app.put("/publish")
def publish():
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        return jsonify({"error": "invalid JSON body"}), 400
    for k in ("title", "content", "cover_base64"):
        if not body.get(k):
            return jsonify({"error": f"missing field: {k}"}), 400
    if len(body["title"]) > 64:
        return jsonify({"error": "title exceeds 64 chars"}), 400
    digest = body.get("digest", "")
    if len(digest) > 120:
        return jsonify({"error": "digest exceeds 120 chars"}), 400

    try:
        header, b64 = body["cover_base64"].split(",", 1)
        mime = header.split(":", 1)[1].split(";", 1)[0]
        cover = base64.b64decode(b64, validate=True)
    except (ValueError, IndexError):
        return jsonify({"error": "invalid cover_base64"}), 400
    if len(cover) > 2 * 1024 * 1024:
        return jsonify({"error": "cover exceeds 2MB"}), 400

    try:
        mat = _wx_post("/cgi-bin/material/add_material", files={
            "media": ("cover." + mime.split("/")[1], io.BytesIO(cover), mime),
        })
        article = {
            "title": body["title"],
            "author": body.get("author", ""),
            "digest": digest,
            "content": body["content"],
            "content_source_url": body.get("content_source_url", ""),
            "thumb_media_id": mat["media_id"],
            "need_open_comment": 0,
            "only_fans_can_comment": 0,
        }
        draft = _wx_post("/cgi-bin/draft/add", json_body={"articles": [article]})
    except requests.RequestException:
        LOG.exception("publish failed")
        return jsonify({"error": "wechat api unreachable"}), 502
    LOG.info("draft created: %s", draft["media_id"])
    return jsonify({"media_id": draft["media_id"]})


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    app.run(host="127.0.0.1", port=PORT)
