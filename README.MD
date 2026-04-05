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










### STEP-6  --> User Management Module Documentation

# Overview

# The User Management module is responsible for:
1. Managing system users
2. Enforcing role-based access control (RBAC)
3. Allowing admin to update or deactivate users
 All routes are protected and accessible only by Admin users.

# Access Control
All endpoints require:
Authorization: Bearer <ADMIN_TOKEN>
Enforced using:
verifyToken → authentication
allowRoles("admin") → authorization

# API Endpoints
🔹 1. Get All Users
   Endpoint
   GET [/api/users](http://localhost:5000/api/users)
   Access : Admin only

# Description
Returns a list of all users in the system.
1. Password is excluded
2. MongoDB fields are normalized (_id → id)
3. Sorted by latest users
- Response Example
{
  "success": true,
  "count": 3,
  "users": [
    {
      "id": "69d134d7e18b468c115d735c",
      "email": "admin@gmail.com",
      "role": "admin",
      "status": "active"
    }
  ]
}
# 📸 Screenshot : File: 3_listUser-response.png
- Shows:
  Successful API call
  Clean formatted response



##  2. Update User (Role / Status)
# API Endpoints
PATCH /api/users/:id
# Description
Updates user role or status.

Example Request
{
  "role": "analyst"
}

OR

{
  "status": "inactive"
}
# Business Rules
Admin cannot modify another admin 
Only valid roles allowed (viewer, analyst)
Only valid status allowed (active, inactive)
 Response Example
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "id": "69d1fcb5ddd9b3506087fc97",
    "email": "analyst@gmail.com",
    "role": "analyst",
    "status": "active"
  }
}
# Screenshots
File: 4_update-user-response.png
 Successful update
File: 4.1_update-user-response.png
 Attempt to modify admin → Forbidden


##  3. Deactivate User (Soft Delete)
# API Endpoints
DELETE /api/users/:id

# Description
Soft deletes a user by setting:
status = "inactive"

# Business Rules
Admin cannot deactivate another admin 
User is not deleted from DB (soft delete)

 Response Example
{
  "success": true,
  "message": "User deactivated successfully"
}
#  Screenshot
File: 5_deactivateUser-response.png
    Shows successful deactivation 


##  4. Login After Deactivation (Security Check)
# API Endpoints
POST /api/auth/login
#  Description
Ensures inactive users cannot log in.

  Expected Response
{
  "success": false,
  "message": "Account is inactive"
}
# Screenshot
File: 5.1_try-login-after-deactivateUser.png
 Shows access blocked 

## Routes Summary 
 | Method | Endpoint       | Description     | Access |
| ------ | -------------- | --------------- | ------ |
| GET    | /api/users     | List all users  | Admin  |
| PATCH  | /api/users/:id | Update user     | Admin  |
| DELETE | /api/users/:id | Deactivate user | Admin  |


# Final Statement 
`The user management module is designed with strict role-based access control, soft deletion strategy, and clean API response formatting to ensure security, maintainability, and scalability`








### STEP - 7  Transactions Module Documentation 

`The assignment suggests viewer access limited to dashboard. I extended it to include read-only transaction access to make the system more practical and closer to real-world usage, while still maintaining strict role-based restrictions.`  


# Overview

The Transactions module is the core part of the system.
It is responsible for:
1. Storing financial records
2. Filtering and viewing transactions
3. Updating and deleting records
4. Supporting dashboard and insights


# Access Controller 
| Role    | Access                               |
| ------- | ------------------------------------ |
| Viewer  | View transactions only               |
| Analyst | View + filter + analyze              |
| Admin   | Full access (create, update, delete) |



##  API Endpoints
 1. Create Transaction
- Endpoint
  POST /api/transactions
Access Admin only

# Description
Creates a new financial record.

Example Request
{
  "amount": 5000,
  "type": "income",
  "category": "salary",
  "date": "2026-04-01",
  "notes": "Monthly salary"
}
 Response
{
  "success": true,
  "message": "Transaction created",
  "transaction": {
    "id": "...",
    "amount": 5000,
    "type": "income",
    "category": "salary"
  }
}
# Screenshot
File: 6_create-transaction.png


 2. Get All Transactions
- Endpoint
GET /api/transactions
 Access All roles

 # Description
Returns list of transactions with:
filtering
pagination
sorting

# Screenshot
File: 7_list-transactions.png


 3. Filtering Transactions
- Examples
GET /api/transactions?type=income
GET /api/transactions?category=salary
GET /api/transactions?from=2026-04-01&to=2026-04-30

# Description
Allows filtering based on:
type (income / expense)

category
date range
# Screenshots
8_filter-transactions.png
8.1_filter-transaction-salary.png
8.2_filter-transaction-date.png



4. Pagination
- Endpoint
GET /api/transactions?page=1&limit=2

# Description
Controls how many records are returned.

# Screenshot
File: 9_pagination.png



 5. Get Single Transaction
- Endpoint
GET /api/transactions/:id

# Description
Returns details of a single transaction.

# Screenshot
File: 10_single-transaction.png



 6. Update Transaction
- Endpoint
PUT /api/transactions/:id
 Access : Admin only

# Description
Updates transaction details.
input should be all 

# Screenshot
File: 12_update-transaction.png


# 7. Delete Transaction
- Endpoint
DELETE /api/transactions/:id
 Access : Admin only

# Description
Deletes a transaction permanently.

# Screenshot
File: 11_delete-transaction.png


 8. Role Restriction Check
 Scenario

Viewer and analyst tries to create/delete transaction.

❌ Expected Response
{
  "success": false,
  "message": "Forbidden"
}

# Screenshot
File: 13_role-restriction.png


# Key Features Implemented
 1. Filtering
Supports:
type
category
date range
Helps in analysis and reporting

 2. Pagination
Reduces large data load
Improves performance

 3. Sorting
Default sorting by date
Ensures latest data first

 4. Clean API Response
_id converted to id
No unnecessary DB fields

5. RBAC (Role-Based Access Control)
Admin → full access
Analyst → read + analysis
Viewer → read only

 6. Data Normalization
type and category stored in lowercase
 avoids duplicate/inconsistent data





#### STEP - 8  Transactions Export (CSV) Module
# Overview

The Export API allows users to download transaction data in CSV (Excel-compatible) format.

This feature is useful for:
1.  Data analysis
2.  Reporting
3.  Sharing financial data externally 

## Access Control
| Role    | Access        |
| ------- | ------------- |
| Viewer  |   Not allowed |
| Analyst |   Allowed     |
| Admin   |   Allowed     |


# API Endpoint
 Export Transactions 

GET /api/transactions/export

# What This API Does
Fetches transaction data from database
Applies optional filters (type, category, date range)
Converts JSON data → CSV format
Sends file as downloadable response

# internal Flow (step-by-step)
Request → Auth Middleware → Role Check → Fetch Data → Convert CSV → Send File


# Successful request

# Key Features
🔹 1. CSV Export
Converts structured data
Excel compatible

🔹 2. Filtering Support
Export specific data
Not entire database

🔹 3. Clean Data Format
No MongoDB fields
Human-readable dates

🔹 4. Role-Based Security
Viewer restricted
Analyst/Admin allowed

🔹 5. Scalable Design
Utility-based architecture
Easy to extend
💥 Final Statement

`“The export feature is designed to provide flexible and secure data extraction by combining filtering capabilities, clean formatting, and role-based access control, ensuring both usability and system integrity.”`

# 14_export-csv-download.png --> proof of working








### step - 9 DASHBOARD SUMMARY API DOCUMENTATION 
🔹 Overview

The Dashboard Summary API provides a high-level financial overview of all transactions in the system.

This API is designed to support the main dashboard view, giving users quick insights into their financial activity without heavy processing.


🔗 Endpoint
GET /api/dashboard/summary

Access Control
| Role    | Access    |
| ------- | --------- |
| Viewer  |   Allowed |
| Analyst |   Allowed |
| Admin   |   Allowed |

# Purpose
This API is optimized for:
1. Fast response time
2. Dashboard-level data (not deep analytics)
3. Quick overview of financial status
 It avoids heavy database aggregation to keep performance efficient.

# Implementation Approach
The API uses a simple and efficient approach:
1. Fetch all transactions from the database
2. Loop through transactions to calculate:
     income and expense totals
     category-wise totals
      monthly trends
3. Fetch latest transactions separately
4. Return structured response
👉 This avoids complex aggregation pipelines and keeps logic easy to understand.

# Design Decisions
1. Used in-memory calculations instead of heavy MongoDB aggregation
2. Focused on readability and simplicity
3. Optimized for dashboard use-case, not deep analytics

# Screenshots
The following screenshots demonstrate the working API:
15_dashboard-summary.png & 15.1_dashboard-summary.png
  → Shows complete dashboard summary response

👉 These confirm:
1. Correct calculation of totals
2. Proper response structure
3. Successful role-based access

# Notes
1. This API is designed for quick insights, not detailed reporting
2. For deeper analysis, separate Insights APIs are implemented
3. The structure is frontend-friendly and easy to integrate with charts






### STEP -10  --> INSIGHTS APIs DOCUMENTATION
# Overview

The Insights APIs provide analytical data derived from transactions.
These APIs are designed for deeper analysis and are typically used for charts, reports, and data visualization.

Unlike the Dashboard API (which provides quick summaries), Insights APIs focus on aggregation and trends.


| Role    | Access        |
| ------- | ------------- |
| Viewer  |  Not Allowed |
| Analyst |  Allowed     |
| Admin   |  Allowed     |


#  1. Category Insights API

🔗 Endpoint
GET /api/insights/category

# Purpose
This API provides total transaction amounts grouped by category.

# What it does
Groups transactions by category
Calculates total amount for each category

` Sample Response`
{
  "success": true,
  "data": {
    "food": 5000,
    "rent": 8000,
    "transport": 3000
  }
}
` Use Cases`
1. Pie chart (spending breakdown)
2. Category-wise analysis
3. Expense distribution


#  2. Monthly Trends API

 Endpoint
GET /api/insights/trends

 Purpose
This API provides month-wise income and expense data to analyze trends over time.

# What it does
1. Groups transactions by month
2. Separates income and expense
3. Returns structured trend data

`Sample Response`
{
  "success": true,
  "data": [
    { "month": 1, "income": 20000, "expense": 10000 },
    { "month": 2, "income": 30000, "expense": 15000 }
  ]
}

`Use Cases`
1. Line charts
2. Monthly financial tracking
3. Trend analysis



#  3. Income vs Expense API

 Endpoint
GET /api/insights/income-vs-expense

# Purpose
This API provides a total comparison of income and expenses.

# What it does
Aggregates all transactions
Calculates total income
Calculates total expense

` Sample Response`
{
  "success": true,
  "data": {
    "income": 100000,
    "expense": 40000
  }
}

` Use Cases`
1. Summary cards
2. Comparison charts
3. Financial overview


## Key Differences Between APIs
| Feature | Category Insights | Monthly Trends  | Income vs Expense |
| ------- | ----------------- | --------------- | ----------------- |
| Type    | Grouping          | Time-based      | Total summary     |
| Output  | Category totals   | Month-wise data | Overall totals    |
| Use     | Breakdown         | Trends          | Comparison        |


## Implementation Approach
MongoDB Aggregation ($group) is used for efficient data processing
Data is transformed into frontend-friendly format
APIs are lightweight and optimized for performance

# Screenshots
Include the following screenshots in your submission:
Insights Category Response
Monthly Trends Response
Income vs Expense Response

# These validate:
Correct aggregation logic
Proper API responses
Role-based access working







### Step - 11  Rate Limiting Documentation

# Overview

Rate limiting is implemented to protect the backend from excessive or abusive requests.

It restricts the number of requests a client can make within a specific time window, helping improve system stability and security.

# Purpose
The rate limiter is used to:
1. Prevent API abuse
2. Protect against brute-force attacks (especially on login APIs)
3. Reduce server load
4. Ensure fair usage across users 


# Implementation
Rate limiting is implemented using the express-rate-limit middleware.

# Configuration
windowMs: 15 * 60 * 1000   // 15 minutes
max: 100                   // max 100 requests per IP

` Behavior`
Each client (IP) can make up to 100 requests within 15 minutes
If the limit is exceeded:
The server blocks further requests temporarily
A proper error response is returned 





#  Project Summary — Finance Data Processing and Access Control Backend

This project is a backend system for a finance dashboard that enables users to manage financial records with role-based access control, structured APIs, and analytical insights.

The system is designed to simulate a real-world backend architecture, focusing on clean design, proper separation of concerns, and practical usability.

` Core Functionality`

The backend supports:

User authentication using JWT
Role-based access control (RBAC)
Financial transaction management (CRUD operations)
Filtering, pagination, and sorting of records
Dashboard-level summaries
Advanced insights using aggregation
CSV export for transaction data
Basic security with rate limiting
 Role-Based Access Control

`The system defines three roles:`

Viewer → Read-only access (dashboard + transactions)
Analyst → Read access + insights
Admin → Full access (users + transactions management)

Access is enforced using middleware (verifyToken + allowRoles), ensuring strict backend-level security.


` Financial Records Management`
Transactions include:
Amount
Type (income / expense)
Category
Date
Notes
CreatedBy (user reference)

`The system supports:`
Create, Read, Update, Delete
Filtering by type, category, and date range
Pagination and sorting

# Dashboard Summary
A dedicated API provides:
Total income
Total expenses
Net balance
Category-wise totals
Recent transactions
Monthly trends

This API is optimized for fast responses and homepage usage.

# Insights APIs

Separate from the dashboard, insights APIs provide deeper analytics:

Category-wise aggregation
Monthly income vs expense trends
Overall income vs expense comparison

These APIs use MongoDB aggregation for efficient data processing.

# CSV Export

Transactions can be exported as a CSV file with applied filters.
This feature improves usability and demonstrates real-world data handling.

# Validation & Error Handling
Input validation using custom validators
Centralized error handling middleware
Proper HTTP status codes and structured error responses

# Security
JWT-based authentication
Role-based authorization
Global rate limiting to prevent abuse

# Design Approach

Key design decisions:

Clear separation of concerns (controllers, routes, middleware)
Middleware-driven RBAC for scalability
Lightweight dashboard logic (no heavy aggregation)
Separate insights layer for analytics
Consistent API response structure


# Tech Stack
Node.js
Express.js
MongoDB (Mongoose)

# Testing & Proof
The project includes a comprehensive /screenshot folder demonstrating:
Authentication
User management
Transaction operations
Filtering & pagination
CSV export
Dashboard summary
Insights APIs


# Final Thought

This project focuses on clarity, correctness, and practical backend design, rather than unnecessary complexity.

It demonstrates:

Strong understanding of backend architecture
Clean implementation of business logic
Real-world features like RBAC, filtering, and analytics