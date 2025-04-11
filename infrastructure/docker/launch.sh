#!/bin/bash

echo "Select an option:"
echo "1. Start Docker containers"
echo "2. Stop Docker containers"
read -p "Enter your choice (1 or 2): " choice

case $choice in
  1)
    echo "Starting Docker containers..."
    sudo docker compose -f mongo-replica-compose.yaml -f quickstart.yml -f quickstart-postgres.yml up -d
    ;;
  2)
    echo "Stopping Docker containers..."
    sudo docker compose -f mongo-replica-compose.yaml -f quickstart.yml -f quickstart-postgres.yml down
    ;;
  *)
    echo "Invalid choice. Exiting."
    ;;
esac
