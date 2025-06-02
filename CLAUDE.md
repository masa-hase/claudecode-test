# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript + Next.js project template configured with:
- **Bun** as the JavaScript runtime and package manager
- **Biome** for formatting and linting (replacing ESLint + Prettier)
- **Development Container** setup for consistent development environment

## Development Environment

The project uses VS Code Dev Containers with:
- Ubuntu base image
- Node.js 20 and Bun pre-installed
- Biome installed globally via post-create script
- Automatic `bun install` on container start (if package.json exists)

## Common Commands

Since this is a template repository without an initialized Next.js project yet, here are the commands to use after project initialization:

### Project Setup
```bash
# Create Next.js project with TypeScript
bunx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --use-bun

# Initialize Biome configuration
bunx @biomejs/biome init
```

### Development Commands (after setup)
```bash
# Install dependencies
bun install

# Run development server
bun dev

# Build for production
bun run build

# Format code with Biome
biome format --write .

# Lint and fix issues with Biome
biome check --write .

# Type checking
bun run typecheck
```

## Code Architecture

This is a template repository ready for Next.js initialization. The intended architecture includes:
- **App Router** (Next.js 13+) without src directory
- **TypeScript** with strict mode
- **Tailwind CSS** for styling
- **Biome** for code quality (format + lint)
- Import alias `@/*` for project root imports

## VS Code Configuration

The devcontainer automatically configures VS Code with:
- Biome as the default formatter for all JavaScript/TypeScript files
- Format on save enabled
- Organize imports on save
- Extensions for Biome, Tailwind CSS, Prisma, and TypeScript