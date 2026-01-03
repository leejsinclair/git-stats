FROM node:24.2.0-alpine

# Install git
RUN apk add --no-cache git

# Configure git to trust all directories
RUN git config --global --add safe.directory '*'

# Set working directory
WORKDIR /app

# Copy package files for backend
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy backend source
COPY src ./src
COPY tsconfig.json ./

# Build backend
RUN npm run build

# Create data directories
RUN mkdir -p data/output data/repos data/visualizations

# Expose backend port
EXPOSE 3000

# Start backend
CMD ["npm", "start"]
