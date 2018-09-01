FROM node:8.11.3-jessie

RUN mkdir /opt/api
COPY . /opt/api
WORKDIR /opt/api

RUN apt-get dist-upgrade
RUN apt-get update
RUN npm config set always-auth true;
RUN npm install

EXPOSE 4000
CMD [ "index.js" ]
ENTRYPOINT ["node"]