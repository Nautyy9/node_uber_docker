FROM node:22-alpine3.19
RUN addgroup app && adduser -S -G app app
USER app
WORKDIR /app
COPY package*.json ./
USER root
RUN chown -R app:app ./
USER app
RUN npm install
COPY . .
EXPOSE 9999
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]