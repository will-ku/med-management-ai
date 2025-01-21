# AI-Enabled Medication Management System

A proof-of-concept full-stack application integrating LLMs with Anthropic’s Model Context Protocol (MCP). This project showcases how natural language interfaces and structured tool interactions can be leveraged for managing medication lists via AI agents.

Most importantly, this project serves as a hands-on exploration of emerging AI protocols and architectures, paving the way for more interactive and dynamic AI-enabled applications.

## Overview

This experimental project highlights cutting-edge advancements in AI and LLM integration:

- Model Context Protocol (MCP) for structured, traceable, and extensible tool interactions
- Local LLM deployment through Ollama, leveraging the open-source Llama 3.2 model
- Natural language processing for practical, domain-specific use cases (medication management)

The application demonstrates how LLMs can interact with backend services seamlessly, using MCP to bridge natural language understanding and tool execution.

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

Key Concepts:

1. Natural Language Queries: Users interact through the frontend by submitting natural language inputs.
2. LLM as Middleware: Ollama interprets queries, interacts with MCP tools, and routes commands to backend services.
3. MCP Tooling: Backend integrations leverage MCP tool calls for:

- Retrieving prescription data
- Updating medication details
- Deleting prescriptions

4. Resources & Context: MCP ensures tools operate within structured contexts for better traceability and modularity.

## Current Features

- Basic natural language interface for medication list management
- MCP Tooling - Implementation of a host-client-server architecture, of structured tool calls via the MCP protocol
- Local LLM integration via Ollama
- Simple medication CRUD operations

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

- [Anthropic's Model Context Protocol](https://modelcontextprotocol.io/introduction) - Modern protocl for structured tool usage with LLMs
- [Ollama](https://ollama.ai/) - Local LLM deployment for private processing
- [Llama](https://ai.meta.com/llama/) - Meta's open source LLM model

## Known Issues

- Bug: LLM struggles with prescription updates/deletes due to missing [MCP resources](https://modelcontextprotocol.io/docs/concepts/resources) implementation
