#!/bin/bash

# Install Biome globally
echo "Installing Biome globally..."
bun install -g @biomejs/biome

# Install Claude Code
echo "Installing Claude Code..."
npm install -g @anthropic-ai/claude-code

echo "Development environment setup complete!"