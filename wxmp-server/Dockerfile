FROM python:3.12-slim
WORKDIR /app
RUN pip install --no-cache-dir flask requests gunicorn
COPY wxmp_server.py .
RUN useradd -r -u 10001 wxpush
USER wxpush
EXPOSE 8787
# Container lifecycle is managed by Compose; no home-directory control socket needed.
CMD ["gunicorn", "--no-control-socket", "-w", "1", "-b", "0.0.0.0:8787", "wxmp_server:app"]
