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




--------------------------------------------------------------------------------------------------------------------------------------------------
### Step - 3
## 1. USER MODEL
 Purpose
The User model handles:
  Authentication (login)
  Authorization (role-based access)
  Account control (active/inactive)

# Fields
Field	         Type	    Description
email	         String	  Unique identifier for login
password	     String	  Hashed password using bcrypt
role	         Enum	    Defines access level (viewer, analyst, admin)
status	       Enum	    Indicates if account is active or disabled 

`Design Decisions`
- Role-Based Access
   viewer → read-only access
   analyst → read + insights
   admin → full control
  Enables RBAC using middleware

# Account Status (Important)
active → user can access system
inactive → user blocked
 Even with valid JWT, inactive users are rejected


# Security
Password is stored hashed (bcrypt)
Never stored in plain text

` Why This Matters`
Central control over permissions
Scalable for adding more roles later
Matches real-world systems


## 2. TRANSACTION MODEL
- Purpose
Stores all financial records used for:
  Dashboard summaries
  Insights analysis
  Filtering & reporting


# Fields
| Field     | Type     | Description                              |
| --------- | -------- | ---------------------------------------- |
| amount    | Number   | Transaction value                        |
| type      | Enum     | `income` or `expense`                    |
| category  | String   | Type of transaction (food, travel, etc.) |
| date      | Date     | When transaction occurred                |
| notes     | String   | Optional description                     |
| createdBy | ObjectId | Reference to User                        |


` Design Decisions`
# createdBy (Critical)
Tracks which user created the record
Useful for:
   auditing
   ownership
   debugging

# Enum Validation
Prevents invalid values like:
"earnings" instead of "income"
Keeps data clean 

# Indexing (VERY IMPORTANT)
transactionSchema.index({ date: 1 });
transactionSchema.index({ category: 1 });

# Why:
Fast filtering
Efficient aggregation 

# Timestamps
Automatically adds:
  createdAt
  updatedAt

# Helps with:
sorting
tracking history

# Why This Matters
Core data layer of system
Supports all analytics features
Optimized for performance


### 3. CATEGORY MODEL ( Strong Design)
 Purpose
Standardizes categories to avoid inconsistent data.


# Fields

| Field | Type   | Description                        |
| ----- | ------ | ---------------------------------- |
| name  | String | Category name (e.g., food, travel) |
| type  | Enum   | `income` or `expense`              |


# Problem It Solves
Without this model:
   "Food" vs "food" vs "FOOD"
     breaks analytics

# Why This Matters
Ensures consistency
Improves aggregation accuracy
Makes system scalable



### 4. AUDIT MODEL (Advanced Feature)
 # Purpose
Tracks system activity for:
 Monitoring
 Debugging
 Security

# Field
| Field    | Type     | Description            |
| -------- | -------- | ---------------------- |
| userId   | ObjectId | Who performed action   |
| action   | Enum     | CREATE, UPDATE, DELETE |
| entity   | Enum     | TRANSACTION or USER    |
| entityId | ObjectId | Target record          |
| metadata | Object   | Extra details          |


# Action Tracking
Tracks:
who did what
when

# Metadata
Allows storing:
old values
new values


# Why This Matters
Tracks actions like create/update/delete
Helps debugging issues
Useful in real companies

# RELATIONSHIP BETWEEN MODELS
Admin ────── creates ──────> Transaction
   │
   └──── tracked in ─────> Audit

--------------------------------------------------------------------------------------------------------------------------------------------------








#### step - 4 
# created seed/seedAdmin 

1. Overview

This script is responsible for creating the initial admin user in the system.

Since the system enforces role-based access control (RBAC) and only admins can create other users, a bootstrap mechanism is required to create the first admin.

This is handled via a one-time seed script, not through public APIs.

`“The first admin is created via a controlled seed script instead of public registration to ensure security and prevent unauthorized admin access.”` 

2. Why Not Create Admin via API?
Because:
Anyone could create an admin → security risk
Breaks RBAC model
Not realistic in production systems













## step-5  AUTH & VALIDATION DOCUMENTATION register and login user or admin

#  1. controllers/auth.controller.js

This file handles authentication and user creation.

🔹 Login API

Endpoint: POST /auth/login
This API allows users to log into the system.

How it works:
1. Takes email and password from request
2. Validates input (basic checks already handled by validator)
3. Finds user in database
4. Checks:
   user exists
   account is active
   password is correct
5. Generates JWT token
6. Returns token and user info
Response Example:
{
  "success": true,
  "message": "Login successful",
  "token": "JWT_TOKEN",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "viewer"
  }
}

🔹 Register User (Admin Only)

Endpoint: POST /auth/register
This API is used by Admin to create new users.

Rules:
Admin cannot be created via API
Only viewer and analyst roles allowed
Email must be unique
Flow:
1. Validate input
2. Check if user already exists
3. Hash password using bcrypt
4. Create user
5. Return user details


# 2. Middleware
🔹 auth.middleware.js (verifyToken)

This middleware checks who the user is.

What it does:

1. Extracts token from request header:
     Authorization: Bearer <token>
2. Verifies JWT
3. Fetches user from database
4. Checks:
   user exists
   account is active
5. Attaches user info to request:
req.user = {
  id: "...",
  role: "admin"
};
👉 This is required for all protected routes.

🔹 role.middleware.js (allowRoles)

This middleware checks what the user is allowed to do.

Usage:
allowRoles("admin")
allowRoles("admin", "analyst")
What it does:
 Checks if req.user.role is allowed
 If not → returns 403 Forbidden


# 3. routes/auth.routes.js

Defines routes related to authentication.

Example:
router.post("/login", validateLogin, login);

router.post(
  "/register",
  verifyToken,
  allowRoles("admin"),
  validateUser,
  register
);

Explanation: 
| Route       | Access     | Description     |
| ----------- | ---------- | --------------- |
| `/login`    | Public     | User login      |
| `/register` | Admin only | Create new user |

#  4. Validators

Validators ensure request data is correct before reaching controller.

🔹 auth.validator.js

Used for login API.
Checks:
email exists
password exists
email format basic check

🔹 user.validator.js
Used for user creation.
Checks:
email, password, role required
role must be viewer or analyst
password length >= 6

🔹 transaction.validator.js
Used for transaction APIs.
Checks:
required fields (amount, type, category, date)
amount is positive
type is valid (income / expense)
date is valid 



#  5. Screenshots (Postman Proof)

You must include these in your project:

🔹 1_login-response.png
Send login request
Show:
success response
JWT token

🔹 2_register-response.png (Viewer)
Login as admin
Use token in header
Create user with role viewer
Show response

🔹 2.1_register-response.png (Token in Header)

Show Postman headers:

Authorization: Bearer <token>

 This proves authentication is working

🔹 2.2_register-response.png (Analyst)
Create user with role analyst
Show successful response 


# Final Notes
Authentication is JWT-based
Authorization is role-based (RBAC)
Middleware ensures security at backend level
Validators prevent invalid input before processing