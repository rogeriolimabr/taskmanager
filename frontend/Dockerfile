# Use an official node runtime as a parent image
FROM node:20

# Install pnpm globally (is better than npm)
RUN npm install -g pnpm

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and install dependencies
COPY package.json /app/package.json

# Install packages
RUN pnpm i

# Copy the rest of the application code
COPY . /app

# Expose the port the app runs on
EXPOSE 3000

# Run the app
CMD ["pnpm", "start"]