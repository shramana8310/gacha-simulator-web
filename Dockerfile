FROM node:16.17.0 AS build
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:1.18-alpine
COPY --from=build /build/build /web/build
COPY nginx.conf.template /etc/nginx
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]