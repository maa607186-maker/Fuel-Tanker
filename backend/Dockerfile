# Use Node.js 22.12 (latest LTS) Alpine for a lightweight image
FROM node:22.12-alpine

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package.json package-lock.json* ./

# Install dependencies (including devDependencies for nodemon)
RUN npm install

# Copy the rest of the app source code
COPY . .

# Expose backend port
EXPOSE 4000

# Start backend in development mode
CMD ["npm", "run", "dev"]
