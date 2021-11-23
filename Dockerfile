FROM node:14.15.3

WORKDIR /video-call

ENV PORT=80

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 80

ENTRYPOINT [ "npm", "run" ]

CMD [ "start:prod" ]
