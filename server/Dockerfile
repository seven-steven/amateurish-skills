FROM python:3.12-slim
WORKDIR /app
RUN pip install --no-cache-dir flask requests gunicorn
COPY server.py .
RUN useradd -r -u 10001 wxpush
USER wxpush
EXPOSE 8787
CMD ["gunicorn", "-w", "1", "-b", "0.0.0.0:8787", "server:app"]
