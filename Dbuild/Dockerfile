# syntax=docker/dockerfile-upstream:master-labs
FROM node:19 as build

ENV NODE_ENV production 
ENV VITE_BIN /app/node_modules/.bin/vite
ENV PATH=$PATH:/app/node_modules/.bin

WORKDIR /app

# COPY package.json ./
# COPY package-lock.json ./
ADD https://github.com/rosaldanha/sals.git /app
RUN npm install -g vite --save-dev
RUN npm install @sveltejs/kit --save-dev
RUN npm rebuild esbuild
RUN npm ci
#RUN ls -alhR ; exit 127
# COPY . ./
RUN npm run build


FROM node:19-alpine3.16

WORKDIR /app
COPY --from=build /app .


ENV HOST=0.0.0.0
EXPOSE 4173
CMD ["tail","-f","/dev/null"]
# CMD ["npm","run", "preview","--", "--host", "0.0.0.0"]