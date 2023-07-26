# syntax=docker/dockerfile-upstream:master-labs
FROM node:19 as build

ENV NODE_ENV production 
ENV VITE_BIN /app/node_modules/.bin/vite


WORKDIR /app

# COPY package.json ./
# COPY package-lock.json ./
ADD https://github.com/rosaldanha/sals.git /app
RUN npm install vite --save-dev
RUN npm rebuild esbuild
RUN npm ci
RUN ls -alh ; exit 127
# COPY . ./
RUN npm run build


FROM node:19-alpine3.16

WORKDIR /app
COPY --from=build /app .


ENV HOST=0.0.0.0
EXPOSE 4173
CMD ["npm","run", "preview","--", "--host", "0.0.0.0"]