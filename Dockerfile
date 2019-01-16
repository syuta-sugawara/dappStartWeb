FROM python:3
ENV PYTHONUNBUFFERED 1
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get -y install openssl ca-certificates libgmp3-dev build-essential && rm -rf /var/lib/apt/lists/*
RUN wget https://github.com/eosio/eos/releases/download/v1.5.0/eosio_1.5.0-1-ubuntu-18.04_amd64.deb
RUN apt install ./eosio_1.5.0-1-ubuntu-18.04_amd64.deb
RUN mkdir /code
WORKDIR /code
ADD requirements.txt /code/
RUN pip install -r requirements.txt
ADD . /code/
