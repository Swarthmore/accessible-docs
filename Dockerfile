FROM node:lts-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy prisma folder (needed for npm i to run cleanly)
COPY prisma/ ./prisma/

# Install dependencies
RUN npm ci 

# Copy the rest of the application code
COPY . .

# Build the Vite app
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Serve the app
CMD ["npm", "run", "serve"]