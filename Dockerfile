FROM node:lts-alpine

ARG NODE_ENV
ARG DB_URL
ARG DB_PASS 
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET

ENV NODE_ENV=$NODE_ENV
ENV DB_URL=$DB_URL
ENV DB_PASS=$DB_PASS
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET

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