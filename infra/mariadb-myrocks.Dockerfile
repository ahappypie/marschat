FROM mariadb:10.3

USER root

RUN apt-get update

RUN apt-get install -y liblz4-dev
RUN apt-get install -y mariadb-plugin-rocksdb

RUN rm -rf /var/cache/apt/lists/*

ADD myrocks.cnf /etc/mysql/conf.d/myrocks.cnf