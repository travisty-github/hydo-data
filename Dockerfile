FROM centos:latest
MAINTAINER Travis Bloomfield <contact@travisbloomfield.com>

# Download only to begin with. If there are any installation errors then
# the downloads are cached.
RUN yum update --downloadonly --assumeyes
RUN yum update --assumeyes
RUN yum install cronie wget --assumeyes
# Get NodeJS 5.x (not available in EPEL)
RUN curl -sL https://rpm.nodesource.com/setup_5.x | bash -
RUN yum install nodejs --assumeyes

# Copy over app and cronfile
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD package.json /usr/src/app
RUN npm install --production
COPY . /usr/src/app
ADD cronfile /var/spool/cron/root

ENV NODE_ENV="production"
ENTRYPOINT crond -n -s
