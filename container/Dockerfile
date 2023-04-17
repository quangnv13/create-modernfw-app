# Use the official Node.js 16 image as the base image
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies for the app
RUN npm install

# Copy the rest of the app files to the container
COPY . .

# Build the app
RUN npm run build

# Expose port 3000 for the app
EXPOSE 3000

# Start the app using the "start" script in package.json
CMD ["npm", "run", "start"]
