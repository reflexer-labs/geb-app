# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:16.14.0-alpine as build-stage
# Installing git, its needed for some dependencies
RUN apk add --no-cache git
WORKDIR /app
COPY package*.json /app/
RUN yarn install
COPY ./ /app/
RUN yarn build
# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.19.0
WORKDIR /usr/share/nginx/html
# Remove default nginx static assets
RUN rm -rf ./*
COPY --from=build-stage /app/build/ .
ENTRYPOINT [ "nginx", "-g", "daemon off;" ] 