### STAGE 1: Build ###
FROM trion/ng-cli AS build
USER root
RUN mkdir -p /usr/src/app
RUN chown root /usr/src/app
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
COPY angular.json ./
RUN npm install
COPY . .
ARG PROFILE=production
RUN echo Building for $PROFILE
RUN ng build --configuration $PROFILE

### Stage 2: Host ###
FROM node:latest
ENV HTTP_SERVER_VERSION 0.9.0
ENV PUBLIC_FOLDER /opt/www
RUN mkdir -p $PUBLIC_FOLDER
RUN npm install -g http-server@0.9.0

#COPY /dist /opt/www
COPY --from=build /usr/src/app/dist /opt/www
RUN ls

CMD http-server $PUBLIC_FOLDER
EXPOSE 8080
