FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Set config
RUN npm config set legacy-peer-deps true

# Install PM2 globally
RUN npm install --global pm2

# Copy "package.json" and "package-lock.json" before other files
# Utilise Docker cache to save re-installing dependencies if unchanged
COPY ./package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build app
RUN npm run build

# Create cache directory
RUN mkdir -p /usr/src/app/build/cache

# Permission and write cache data
RUN chmod -R 777 /usr/src/app/build/cache

# Expose the listening port
EXPOSE 3000

# The "node" user is provided in the Node.js Alpine base image
USER node

# Launch app with PM2
CMD [ "pm2-runtime", "start", "npm", "--", "start" ]
