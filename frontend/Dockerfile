# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies
RUN npm install -g @angular/cli && npm install

# Copy source code
COPY . .

# Build for production
RUN ng build --configuration=production

# Production stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist/ennotes-frontend/browser /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
