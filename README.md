# AI-Enabled Medication Management System

A proof-of-concept full-stack application integrating LLMs with Anthropic’s Model Context Protocol (MCP). This project showcases how natural language interfaces and structured tool interactions can be leveraged for managing medication lists via AI agents.

Most importantly, this project serves as a hands-on exploration of emerging AI protocols and architectures, enabling users to interact with their data without relying on traditional forms.

## Overview

This experimental project highlights cutting-edge advancements in AI and LLM integration:

- Model Context Protocol (MCP) for structured, traceable, and extensible tool interactions
- Local LLM deployment through Ollama, leveraging the open-source Llama 3.2 model
- Natural language processing for practical, domain-specific use cases (medication management)

The application demonstrates how LLMs can interact with backend services seamlessly, using MCP to bridge natural language understanding and tool execution.

## Architecture

```
┌─────────────────┐       ┌───────────────────┐       ┌──────────────────┐
│      React      │       │      Express      │       │      Ollama      │
│    Frontend     │──────▶│      Backend      │──────▶│    (LLM Agent)   │
└─────────────────┘       └───────────────────┘       └──────────────────┘
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

**Key Concepts:**

1. Natural Language Queries: Users interact through the frontend by submitting natural language inputs.
2. LLM as Middleware: Ollama interprets queries, interacts with MCP tools, and routes commands to backend services.
3. MCP Tooling: Backend integrations (host-client-server architecture) leverage MCP tool calls for basic CRUD operations:

- Retrieving prescription data
- Updating medication details
- Deleting prescriptions

## Demo

- Natural language interface for retrieving and deleting prescriptions from SQLite database.
- Guardrails to ensure conversations stay on topic.

https://github.com/user-attachments/assets/94387c22-6055-4d61-95ff-8280546a2ef7

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
docker compose up --build
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
- WIP: Create new prescription using chat
