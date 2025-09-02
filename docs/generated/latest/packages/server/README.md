# @maravian/maravian-sockets-server

Production-ready WebSocket server implementation with built-in authentication, room management, and real-time messaging.

## Overview

The Maravian Sockets server provides a complete backend solution for real-time applications. It includes user management, schema validation, room-based messaging, and an administrative dashboard.

## Key Features

- **WebSocket Server**: High-performance Socket.IO-based real-time communication
- **User Authentication**: JWT-based authentication with role management
- **Room Management**: Create and manage chat rooms or channels
- **Schema Validation**: Runtime validation of messages against defined schemas
- **Admin Dashboard**: Web-based interface for monitoring and management
- **Database**: SQLite database with automatic migrations
- **RESTful API**: HTTP endpoints for configuration and management

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server port |
| `JWT_SECRET` | `dev-secret` | Secret for JWT token signing |
| `DB_PATH` | `./data/socketmax.db` | Database file path |
| `CORS_ORIGIN` | `*` | Allowed CORS origins |
| `ADMIN_EMAIL` | - | Bootstrap admin email |
| `ADMIN_PASSWORD` | - | Bootstrap admin password |

## Quick Start

### Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev:server

# Server runs on http://localhost:8080
```

### Production (Docker)

```bash
# Build and run with Docker Compose
docker compose up --build -d

# Server runs on http://localhost:8080 with dashboard
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Application Management
- `POST /api/apps` - Create new application
- `GET /api/apps` - List applications (admin only)

### Schema Management
- `POST /api/schema/push` - Push new schema version
- `GET /api/schema/latest` - Get latest schema
- `GET /api/schema/versions` - List schema versions

### Real-time Events
- `GET /api/events` - Retrieve message history

## Socket.IO Events

### Client to Server
- `join-room` - Join a specific room
- `leave-room` - Leave a room
- `publish` - Send a message to a topic

### Server to Client
- `message` - Receive a published message
- `user-joined` - User joined notification
- `user-left` - User left notification

## Database Schema

The server uses SQLite with the following main tables:
- `users` - User accounts and authentication
- `apps` - Application configurations
- `schemas` - Schema versions and definitions
- `events` - Message history and logs

## Dashboard

The built-in dashboard provides:
- User management and monitoring
- Real-time message viewing
- Schema version management
- Application statistics
- System health monitoring

Access the dashboard at `http://localhost:8080/` when the server is running.

## API Reference

For complete API documentation, see the [generated TypeDoc documentation](../../docs/generated/latest/packages/server).

## Version

Current version: 0.5.0

## License

See the main project license for details.
