# Zorvyn Backend Assignment

Backend system for financial dashboard with:

- User roles (Admin, Analyst, Viewer)
- Transactions management
- Dashboard & insights APIs
- Role-Based Access Control(RBAC) using middleware
- JWT authentication

## Tech Stack
- Node.js
- Express
- MongoDB

## Status
Initial setup completed  



## step-2
## Implementation Progress

### 1. Project Setup
- Initialized Node.js project
- Installed core dependencies (Express, Mongoose, dotenv, etc.)
- Configured development environment with nodemon

---

### 2. Database Connection
- Connected MongoDB using Mongoose
- Environment-based configuration using `.env`
- Proper error handling for connection failures

---

### 3. Middleware Setup
- Global error handling middleware implemented
- Async handler added to eliminate repetitive try/catch blocks
- Enabled CORS for cross-origin requests
- Configured request parsing:
  - `express.json()`
  - `express.urlencoded()`