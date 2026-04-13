# Stage 1: Build the Expo web application
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
# Using 'npm install' to ensure all dependencies for building are available
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the web app
# Expo uses 'npx expo export' to generate a static 'dist' folder
# The environment variables from .env will be baked into the build automatically if they start with EXPO_PUBLIC_
RUN npx expo export --platform web

# Stage 2: Serve the static files using a lightweight server
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install 'serve' package to serve static files
RUN npm install -g serve

# Copy only the built 'dist' folder from the build stage
COPY --from=build /app/dist /app/dist

# Cloud Run sets the PORT environment variable. We use 8080 as a default.
ENV PORT=8080
EXPOSE 8080

# Start 'serve' on the port provided by the environment
# -s flag is for single-page apps (routes to index.html)
# -l flag specifies the listening port
CMD ["sh", "-c", "serve -s dist -l ${PORT}"]
