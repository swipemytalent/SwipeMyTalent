# Project Handover: SwipeMyTalent Backend

## Overview

The backend is a **Node.js + Express** API for *SwipeMyTalent*. It supports authentication, messaging, exchanges, ratings, and notifications. The stack includes **Socket.IO** for real-time messaging, **web push notifications**, **PostgreSQL** for data, and **Docker** for containerization. Monitoring is provided by **Prometheus** and **Grafana**.

---

## Key Technologies

| Area              | Tech Used                                     |
|-------------------|-----------------------------------------------|
| Language          | TypeScript                                    |
| Server Framework  | Express                                       |
| Database          | PostgreSQL                                    |
| Realtime Comm     | Socket.IO                                     |
| Notifications     | Web Push (VAPID)                              |
| Job Scheduling    | node-cron                                     |
| Containerization  | Docker, Docker Compose                        |
| Reverse Proxy     | Traefik                                       |
| Monitoring        | Prometheus + Grafana                          |

---

## Project Structure

### `handlers/`

Route-specific logic is modularized into:

- `register.ts`, `register.ts`
- `profile.ts`, `users.ts`
- `conversations.ts`, `messages.ts`
- `exchanges.ts`, `exchangeActions.ts`
- `notifications.ts`, `pushNotifications.ts`

### `utils/`

- `origins.ts`: Reads allowed CORS origins from secret/env.
- `date.ts`: Format date.
- `getEnv.ts`: Get all Endpointv/secret variables.
- `readSecret.ts`: Read Docker secret.
- `sendPushNotifications.ts`: Send web push notifications if user is offline.

### `jobs/`

- `deleteUnsubscribedUsers.js`: Cleans up stale users via scheduled cron job.

---

## REST API Overview

### Authentication & Profile

| Method | Endpoint             | Description               |
|--------|----------------------|---------------------------|
| POST   | `/register`          | Register a new user       |
| POST   | `/login`             | Log in a user             |
| GET    | `/profile`           | Get profile               |
| PUT    | `/profile`           | Update profile            |
| DELETE | `/unsubscribe`       | Unsubscribe user          |

### Conversations & Messaging

| Method | Endpoint                                      | Description                 |
|--------|-----------------------------------------------|-----------------------------|
| GET    | `/conversations/:userId`                      | List conversations          |
| GET    | `/conversations/:conversationId/messages`     | Get messages in a convo     |
| PUT    | `/conversations/:conversationId/read`         | Mark conversation as read   |
| POST   | `/messages`                                   | Send a message              |

### Exchanges

| Method | Endpoint                        | Description               |
|--------|---------------------------------|---------------------------|
| POST   | `/exchanges`                    | Create an exchange        |
| PUT    | `/exchanges/:id/confirm`        | Confirm exchange          |
| PUT    | `/exchanges/:id/complete`       | Mark exchange complete    |
| GET    | `/exchanges`                    | List user exchanges       |
| GET    | `/exchanges/:id/rating`         | Get exchange rating       |

### Ratings

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| POST   | `/rate/:userId`           | Submit a rating          |
| GET    | `/users/:id/ratings`      | Get user ratings         |

### Notifications

| Method | Endpoint                         | Description                |
|--------|----------------------------------|----------------------------|
| GET    | `/notifications`                 | Get notifications          |
| PUT    | `/notifications/:id/read`        | Mark notification as read  |
| PUT    | `/notifications/read-all`        | Mark all as read           |
| DELETE | `/notifications/:id`             | Delete a notification      |

### Push Notifications

| Method | Endpoint                        | Description                       |
|--------|---------------------------------|-----------------------------------|
| GET    | `/push/vapid-public-key`       | Fetch public VAPID key            |
| POST   | `/push/subscribe`              | Subscribe to push notifications   |
| POST   | `/push/unsubscribe`            | Unsubscribe from push             |

---

## Socket.IO Events

- `register`: Register user socket on connection.
- `disconnect`: Remove user from socket map on disconnect.

A `Map<string, string>` tracks `userId` → `socketId` relationships.

```ts
io.on('connection', (socket) => {
  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
  });
  socket.on('disconnect', () => {
        for (const [userId, socketId] of connectedUsers.entries()) {
            if (socketId === socket.id) {
                connectedUsers.delete(userId);

                break;
            }
        }
        console.log(`❌ User disconnected: ${socket.id}`);
  });
});
```

## Local Development

`compose.yaml`

```sh
docker compose up -d
```

- **Frontend**: [localhost:8080](http://localhost:8080)
- **Backend**: [localhost:5000](http://localhost:5000)

The backend uses `.env` from `./backend/.env`.
