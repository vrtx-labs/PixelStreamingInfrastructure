FROM  --platform=${BUILDPLATFORM:-linux/amd64} python:alpine3.18

RUN pip install --upgrade pip

RUN adduser -D worker
USER worker
WORKDIR /home/worker

COPY --chown=worker:worker requirements.txt requirements.txt
RUN pip install --user -r requirements.txt

ENV PATH="/home/worker/.local/bin:${PATH}"

COPY --chown=worker:worker app.py .

RUN chmod +x app.py

ENTRYPOINT [ "python", "app.py"]