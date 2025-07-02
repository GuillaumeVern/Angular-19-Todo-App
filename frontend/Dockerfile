FROM node:alpine

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN npm install -g @angular/cli

RUN npm install

ENV NODE_ENV=development

CMD ["ng", "serve", "--configuration", "development", "--host", "0.0.0.0", "--verbose"]