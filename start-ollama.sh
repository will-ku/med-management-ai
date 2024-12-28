#!/bin/bash
set -e

# Start the Ollama service in the background
ollama serve &

# Wait for the service to be ready
sleep 5

# Pull the required model
ollama pull llama3.2

# Wait for all background processes
wait 