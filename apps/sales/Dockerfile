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
RUN export NODE_TLS_REJECT_UNAUTHORIZED=0
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
RUN corepack enable
RUN corepack prepare yarn@4.6.0 --activate
RUN npm config set strict-ssl false
RUN yarn config set enableStrictSsl false
RUN yarn set version 4.6.0

# Copy the rest of the application code to the working directory
COPY . .

RUN yarn install
# Build the application
RUN yarn workspace @app/sales run build
# Build the Next.js app
# RUN npm run build && \
# 		npm prune --production

# Stage 2: Create the final image
# FROM node:22-alpine

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set the working directory inside the container
# WORKDIR /app

# Copy only the necessary files from the builder stage
# COPY --from=builder /app/apps/sales/node_modules ./node_modules
# COPY --from=builder /app/apps/sales/.next ./.next
# COPY --from=builder /app/apps/sales/public ./public

# RUN yarn install --production
# Change ownership to the non-root user
# RUN chown -R appuser:appgroup /app

# Switch to the non-root user
# USER appuser

# Expose port 8080 to the outside world
EXPOSE 3001

# Set environment variable to specify the port
ENV PORT 3001

# Start the Next.js app
# CMD ["node", "server.js"]
CMD ["yarn", "workspace", "@app/sales", "run", "start"]