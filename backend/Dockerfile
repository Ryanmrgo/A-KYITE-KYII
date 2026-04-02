# 1. Start with a lightweight Node.js environment
FROM node:20-alpine

# 2. Tell Docker to do all future work inside this folder in the container
WORKDIR /app

# 3. Copy ONLY your package files first. 
# (This is a pro-tip: it caches your dependencies so future builds are 10x faster!)
COPY package*.json ./

# 4. Install your Node modules inside the container
RUN npm install

# 5. NOW copy the rest of your backend code (like server.js and your routes)
COPY . .

# 6. Expose the port your Express server listens on (assuming it uses 5000)
EXPOSE 5000

# 7. The command to boot up the server
CMD ["node", "server.js"]