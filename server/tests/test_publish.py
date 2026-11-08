"""Exercise /publish through Requests' real HTTP request serialization."""
from __future__ import annotations

import io
import json
import os
import unittest
from unittest.mock import patch

import requests

with patch.dict(os.environ, {
    "WX_APP_ID": "test-app-id",
    "WX_APP_SECRET": "test-app-secret",
    "WX_TOKEN": "test-api-token",
    "WX_RATE_LIMIT": "30",
}):
    from server import server


class PublishEncodingTests(unittest.TestCase):
    def setUp(self):
        self.outgoing = []
        self.payload = {
            "title": "中文标题：PARA 工作流",
            "author": "中文作者",
            "digest": "中文摘要——整理笔记",
            "content": "<p>中文正文，标点与链接。</p>",
            "content_source_url": "https://example.com/notes",
            "cover_base64": "data:image/png;base64,aW1hZ2U=",
        }
        with server._rate_lock:
            server._rate_buckets.clear()
        self.enterContext(patch.object(
            server, "access_token", return_value="test-access-token",
        ))
        self.enterContext(patch.object(
            requests.Session, "send", side_effect=self._send,
        ))

    def _send(self, prepared, **kwargs):
        self.outgoing.append(prepared)
        replies = {
            "/cgi-bin/material/add_material": {"media_id": "test-cover-id"},
            "/cgi-bin/draft/add": {"media_id": "test-draft-id"},
            "/cgi-bin/media/uploadimg": {"url": "https://example.com/image.png"},
        }
        path = prepared.path_url.split("?")[0]
        self.assertIn(path, replies)
        response = requests.Response()
        response.status_code = 200
        response._content = json.dumps(replies[path]).encode("utf-8")
        return response

    def _publish(self):
        response = server.app.test_client().put(
            "/publish", json=self.payload,
            headers={"Authorization": "Bearer test-api-token"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {"media_id": "test-draft-id"})
        self.assertEqual(len(self.outgoing), 2)
        draft = self.outgoing[1]
        self.assertEqual(draft.path_url.split("?")[0], "/cgi-bin/draft/add")
        return draft

    def test_draft_sends_chinese_as_utf8(self):
        draft = self._publish()
        article = json.loads(draft.body)["articles"][0]
        for field in ("title", "author", "digest", "content", "content_source_url"):
            with self.subTest(field=field):
                self.assertEqual(article[field], self.payload[field])
                self.assertIn(self.payload[field].encode("utf-8"), draft.body)
        self.assertEqual(article["thumb_media_id"], "test-cover-id")

    def test_draft_sends_emoji_as_utf8(self):
        self.payload["title"] = "中文与 emoji 🚀🧪"
        self.payload["content"] = "<p>正文 🚀🧪</p>"
        draft = self._publish()
        self.assertIn("🚀🧪".encode("utf-8"), draft.body)
        self.assertEqual(json.loads(draft.body)["articles"][0]["title"], self.payload["title"])

    def test_draft_preserves_json_special_characters(self):
        self.payload["content"] = '<p title="引用">中文 & emoji 🚀</p>\n' + r"字面量 \u4e2d 与 C:\notes"
        draft = self._publish()
        article = json.loads(draft.body)["articles"][0]
        self.assertEqual(article["content"], self.payload["content"])

    def test_draft_sets_json_content_type_and_byte_length(self):
        draft = self._publish()
        self.assertIsInstance(draft.body, bytes)
        self.assertEqual(draft.headers["Content-Type"], "application/json; charset=utf-8")
        self.assertEqual(int(draft.headers["Content-Length"]), len(draft.body))

    def test_cover_upload_remains_multipart(self):
        self._publish()
        cover = self.outgoing[0]
        self.assertEqual(cover.path_url.split("?")[0], "/cgi-bin/material/add_material")
        self.assertTrue(cover.headers["Content-Type"].startswith("multipart/form-data; boundary="))
        self.assertIn(b'name="media"; filename="cover.png"', cover.body)
        self.assertIn(b"Content-Type: image/png\r\n\r\nimage\r\n", cover.body)

    def test_body_image_upload_remains_multipart(self):
        response = server.app.test_client().put(
            "/publish/img", data={"image": (io.BytesIO(b"image"), "body.png", "image/png")},
            headers={"Authorization": "Bearer test-api-token"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {"url": "https://example.com/image.png"})
        self.assertEqual(len(self.outgoing), 1)
        image = self.outgoing[0]
        self.assertTrue(image.headers["Content-Type"].startswith("multipart/form-data; boundary="))
        self.assertIn(b'name="media"; filename="body.png"', image.body)
        self.assertIn(b"Content-Type: image/png\r\n\r\nimage\r\n", image.body)


if __name__ == "__main__":
    unittest.main()
