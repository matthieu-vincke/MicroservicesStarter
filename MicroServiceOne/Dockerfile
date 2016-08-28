# Based on the latest version as of 2016-06-04
FROM node:latest

#ADD package.json /tmp/package.json
#RUN cd /tmp && npm install
#RUN mkdir -p /usr/src/app && cp -a /tmp/node_modules /usr/src/app

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

COPY . /usr/src/app

# Open the port of our application
EXPOSE 10010

# Start the application
CMD ["node","app.js"]
