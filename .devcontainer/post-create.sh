#!/bin/bash

# Install Biome globally
echo "Installing Biome globally..."
bun install -g @biomejs/biome

# Install Claude Code
echo "Installing Claude Code..."
npm install -g @anthropic-ai/claude-code

# Create act configuration directory
mkdir -p ~/.config/act

# Create default act configuration for better compatibility
cat > ~/.config/act/actrc << EOF
# Default image for act
-P ubuntu-latest=catthehacker/ubuntu:act-latest
-P ubuntu-22.04=catthehacker/ubuntu:act-22.04
-P ubuntu-20.04=catthehacker/ubuntu:act-20.04
EOF

echo "Development environment setup complete!"