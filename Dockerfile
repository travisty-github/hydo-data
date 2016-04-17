FROM alpine:latest
RUN apk update
RUN apk upgrade
RUN apk add nodejs
EXPOSE 27017
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

ADD cronfile /etc/cron.d/root
RUN chmod 0644 /etc/cron.d/root

RUN npm install --production
ENV NODE_ENV="production"
ENTRYPOINT crond -f -l 0 -c /etc/cron.d/
