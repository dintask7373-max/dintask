# DinTask Backend API

This is a MERN stack backend structure for the DinTask project.

## Tech Stack
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB & Mongoose**: Database and ODM
- **JWT**: Authentication
- **Bcryptjs**: Password hashing

## Project Structure
```
Backend/
├── src/
│   ├── config/          # Database connection
│   ├── controllers/     # Role-specific controllers (employee, admin, etc.)
│   ├── middleware/      # Auth (RBAC via JWT role) & Error middlewares
│   ├── models/          # Role-specific schemas (Employee, SalesExecutive, etc.)
│   ├── routes/          # Role-specific routes
│   ├── utils/           # Utility functions
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── .env                 # Environment variables
├── package.json         # Dependencies and scripts
└── README.md            # Project documentation
```

## User Roles & Models
Each role has its own database collection, controller, and route module for maximum modularity:
- `Employee` (Model, Controller, Routes)
- `SalesExecutive` (Model, Controller, Routes)
- `Manager` (Model, Controller, Routes)
- `Admin` (Model, Controller, Routes)
- `SuperAdmin` (Model, Controller, Routes)

## API Endpoints
- `POST /api/v1/auth/register`: Register providing a `role`.
- `POST /api/v1/auth/login`: Login.
- `GET /api/v1/employee/me`: Employee Profile.
- `GET /api/v1/sales/me`: Sales Executive Profile.
- `GET /api/v1/manager/employees`: Team oversight for Managers.
- `GET /api/v1/admin/users`: Global user management for Admins.
- `GET /api/v1/superadmin/stats`: High-level stats for Super Admin.

## Getting Started
1. Run `npm install` to install dependencies.
2. Update `.env` with your MongoDB URI.
3. Run `npm run dev` to start the development server.
