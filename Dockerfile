# Stage 1: Build stage
FROM node:20 AS builder

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN yarn install

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN yarn run build

# Stage 2: Production stage
FROM node:20-slim

# Create app directory in a cleaner image
WORKDIR /usr/src/app

# Only copy the built artifacts and necessary resources from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# If you have other directories or files to include, like configurations or shared libraries, copy them here
# COPY --from=builder /usr/src/app/config ./config

# Expose the port the app runs on
EXPOSE 8080

# Start the server using the production build
CMD ["node", "dist/main.js"]
