FROM alpine:latest
RUN apk update && apk add nodejs npm
RUN mkdir /opt/jsontool
COPY . /opt/jsontool
WORKDIR /opt/jsontool
RUN npm install

EXPOSE 8080
CMD ["npm", "run", "serve"]


