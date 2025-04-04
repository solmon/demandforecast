# Stage 1: Build the application
FROM node:22-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json files to the working directory
# COPY package.json yarn.lock ./
COPY package.json ./
# COPY .yarnrc.yml ./

# Install dependencies
# RUN yarn install --frozen-lockfile
RUN yarn config set strict-ssl false
RUN yarn install

# Copy the rest of the application code to the working directory
COPY . .

# Build the application
RUN yarn build
# Build the Next.js app
# RUN npm run build && \
# 		npm prune --production

# Stage 2: Create the final image
FROM node:22-alpine

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set the working directory inside the container
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Change ownership to the non-root user
RUN chown -R appuser:appgroup /app

# Switch to the non-root user
USER appuser

# Expose port 8080 to the outside world
EXPOSE 8080

# Set environment variable to specify the port
ENV PORT 8080

# Start the Next.js app
# CMD ["node", "server.js"]
CMD ["yarn", "start"]