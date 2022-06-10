FROM python:3.9.0

WORKDIR /app

RUN pip3 install beautifulsoup4
RUN pip3 install requests

COPY . .


CMD python3 ./server.py