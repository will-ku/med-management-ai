# AI-Enabled Medication Management System

A proof-of-concept full-stack application exploring the integration of LLMs and Anthropic's Model Context Protocol (MCP). This project demonstrates how natural language interfaces could potentially manage medication lists through AI agents and structured tool calls.

Most of all, this project is a learning exercise to experiment with how to integrate LLMs with backend services and explore architectual patterns for AI-enabled applications.

## Overview

This experimental project explores several emerging technologies in the AI/LLM space:

- Anthropic's Model Context Protocol (MCP) for structured tool interactions
- Local LLM deployment and integration via Ollama
- Natural language processing for medication management (though the pattern can extend to any domain)

## Architecture

```
┌─────────────────┐      ┌───────────────────┐       ┌──────────────────┐
│      React      │      │       Express     │       │      Ollama      │
│    Frontend     │──────▶      Backend      │──────▶│    (LLM Agent)   │
└─────────────────┘      └───────────────────┘       └──────────────────┘
                                    │                           │
                                    │                           │
                                    ▼                           │
                         ┌───────────────────┐                  │
                         │      SQLite3      │                  │
                         │      Database     │                  │
                         └───────────────────┘                  │
                                    ▲                           │
                                    │                           │
                         ┌───────────────────┐                  │
                         │    MCP Server     │◀─────────────────┘
                         │  (Tool Provider)  │
                         └───────────────────┘

```

The prototype demonstrates a pattern where:

1. Frontend sends natural language queries to Express backend
2. Backend forwards these queries to Ollama LLM Agent
3. Ollama processes queries and uses MCP tools when needed to:
   - Get current prescriptions
   - Update medication details
   - Delete prescriptions
4. MCP Server handles tool calls by executing database operations
5. Results flow back through the chain to the frontend

This experimental architecture shows how LLMs could potentially interact with backend services in a structured way through the MCP protocol.

## Current Features

- Basic natural language interface for medication list management
- Proof-of-concept implementation of MCP tool calls
- Simple medication CRUD operations
- Local LLM integration via Ollama

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/will-ku/med-management-ai.git
cd med-management-ai
```

2. Start the application using Docker Compose:

```bash
docker-compose up --build
```

The development servers will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Ollama API: http://localhost:11434

## Technologies Explored

- [Anthropic's Model Context Protocol](https://modelcontextprotocol.io/introduction) - For structured LLM tool usage
- [Ollama](https://ollama.ai/) - Local LLM deployment
- [Llama](https://ai.meta.com/llama/) - Open source LLM model

## Known Issues

- Bug: LLM struggles with prescription updates/deletes due to missing [MCP resources](https://modelcontextprotocol.io/docs/concepts/resources) implementation
