"""Smoke-test the image's real Gunicorn command as a non-root user.

Run with Flask, Requests and Gunicorn installed, as in the server image.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
import re
import signal
import subprocess
import sys
import tempfile
import time
import unittest
from urllib.error import URLError
from urllib.request import urlopen

SERVER_DIR = Path(__file__).resolve().parents[1]


@unittest.skipIf(os.name != "posix" or os.geteuid() == 0, "requires a non-root POSIX user")
class GunicornStartupTests(unittest.TestCase):
    def test_container_command_works_without_writable_home(self):
        command = next(
            json.loads(line.removeprefix("CMD "))
            for line in (SERVER_DIR / "Dockerfile").read_text().splitlines()
            if line.startswith("CMD ")
        )
        self.assertEqual(command[0], "gunicorn")
        # Keep all image options, but let the OS choose an isolated local port.
        command[command.index("-b") + 1] = "127.0.0.1:0"

        with tempfile.TemporaryDirectory(prefix="wxpush-startup-") as tmp:
            root = Path(tmp)
            home_parent = root / "home"
            home_parent.mkdir(mode=0o555)
            env = dict(os.environ, HOME=str(home_parent / "wxpush"),
                       WX_APP_ID="test-app-id", WX_APP_SECRET="test-app-secret",
                       WX_TOKEN="test-api-token")
            # Do not let developer overrides hide the image's default behavior.
            env.pop("XDG_RUNTIME_DIR", None)
            env.pop("GUNICORN_CMD_ARGS", None)
            try:
                with (root / "gunicorn.log").open("w+") as log:
                    process = subprocess.Popen(
                        [sys.executable, "-m", *command], cwd=SERVER_DIR, env=env,
                        stdout=log, stderr=subprocess.STDOUT,
                    )
                    try:
                        deadline = time.monotonic() + 10
                        while time.monotonic() < deadline:
                            output = (root / "gunicorn.log").read_text()
                            match = re.search(r"Listening at: http://127\.0\.0\.1:(\d+)", output)
                            if process.poll() is not None:
                                self.fail(f"Gunicorn exited during startup:\n{output}")
                            if match:
                                try:
                                    with urlopen(f"http://127.0.0.1:{match[1]}/health", timeout=1) as response:
                                        self.assertEqual(response.status, 200)
                                        self.assertEqual(json.load(response), {"ok": True})
                                    # The control server starts on a separate thread;
                                    # let it report startup errors before shutdown.
                                    time.sleep(0.25)
                                    break
                                except (URLError, TimeoutError):
                                    pass
                            time.sleep(0.05)
                        else:
                            self.fail(f"Gunicorn never became healthy:\n{output}")
                    finally:
                        if process.poll() is None:
                            process.send_signal(signal.SIGTERM)
                        try:
                            process.wait(timeout=5)
                        except subprocess.TimeoutExpired:
                            process.kill()
                            process.wait()
                            self.fail("Gunicorn did not stop gracefully")

                    output = (root / "gunicorn.log").read_text()
                    self.assertEqual(process.returncode, 0, output)
                    self.assertNotIn("Control server error", output)
                    self.assertNotIn("Permission denied", output)
            finally:
                home_parent.chmod(0o755)


if __name__ == "__main__":
    unittest.main()
