FROM node:18-alpine

# create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# copy files
COPY server.js .
COPY public ./public

# change ownership
RUN chown -R appuser:appgroup /app

# switch to non-root user
USER appuser

EXPOSE 3000

CMD ["node", "server.js"]
