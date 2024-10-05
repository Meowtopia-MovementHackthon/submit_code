FROM node:20.13.1-alpine AS build-stage

WORKDIR /app

COPY package.json yarn.lock ./
COPY public ./
RUN yarn install

COPY . .

RUN yarn build

FROM node:20.13.1-alpine AS production

COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/node_modules ./node_modules
COPY --from=build-stage /app/public ./public

EXPOSE 3000
CMD ["node", "dist/main.js"]