#!/bin/bash

# Test script for act (GitHub Actions local runner)

echo "Testing act installation and Docker-in-Docker setup..."

# Check if act is installed
if command -v act &> /dev/null; then
    echo "✅ act is installed"
    act --version
else
    echo "❌ act is not installed"
    exit 1
fi

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "✅ Docker is available"
    docker --version
else
    echo "❌ Docker is not available"
    exit 1
fi

# Test Docker daemon connectivity
if docker ps &> /dev/null; then
    echo "✅ Docker daemon is running and accessible"
else
    echo "❌ Cannot connect to Docker daemon"
    echo "   You may need to restart the container for Docker group permissions to take effect"
    exit 1
fi

echo ""
echo "Available GitHub Actions workflows:"
ls -la .github/workflows/*.yml 2>/dev/null || echo "No workflows found"

echo ""
echo "Example act commands you can run:"
echo "  act -l                    # List all available workflows and jobs"
echo "  act push                  # Run workflows triggered by 'push' event"
echo "  act -j test              # Run a specific job named 'test'"
echo "  act -n                   # Dry run (show what would be executed)"
echo "  act --container-architecture linux/amd64  # Force x64 architecture"

echo ""
echo "To test a specific workflow:"
echo "  act -W .github/workflows/test.yml"