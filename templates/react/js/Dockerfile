# Use an official Node.js runtime as a parent image
FROM node:16-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and yarn.lock files to the working directory
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application files to the working directory
COPY . .

# Build the application
RUN yarn build

# Expose the port that the application will be served on
EXPOSE 3000

# Start the application
CMD ["yarn", "serve"]
