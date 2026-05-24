# XWZ Car Parking Management System
### National Exam — RESTful API with Microservices Architecture

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, React Query, React Router v6 |
| Backend | Node.js, Express.js |
| Database | PostgreSQL + Sequelize ORM |
| Auth | JWT (JSON Web Tokens) |
| API Docs | Swagger UI |
| Logging | Winston |
| Security | Helmet, CORS, Rate Limiting |

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### 1. Create the database
Open pgAdmin or psql and run:
```sql
CREATE DATABASE parking_management;
```

### 2. Configure backend environment
The `.env` file is already created. Update DB credentials if needed:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=parking_management
DB_USER=postgres
DB_PASSWORD=postgres
```

### 3. Start the backend
Open a terminal in the `backend` folder:
```bash
node src/server.js
```

### 4. Seed demo data
In the same `backend` folder:
```bash
node src/seeders/seed.js
```

### 5. Install and start the frontend
Open a terminal in the `frontend` folder:
```bash
npm install
npm start
```

---

## Access Points

| Service | URL |
|---|---|
| Frontend App | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| **Swagger API Docs** | **http://localhost:5000/api-docs** |
| Health Check | http://localhost:5000/health |

---

## Demo Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@parking.com | admin123 |
| Parking Attendant | attendant@parking.com | attendant123 |

---

## API Endpoints Summary

### Auth (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login, returns JWT |
| GET | `/me` | Any auth | Get own profile |
| GET | `/users` | Admin | List all users (paginated) |
| PUT | `/users/:id` | Admin | Update user role/status |

### Parkings (`/api/parkings`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Admin | Register new parking |
| GET | `/` | Any auth | List all parkings (paginated, searchable) |
| GET | `/:id` | Any auth | Get parking by ID |
| PUT | `/:id` | Admin | Update parking |
| DELETE | `/:id` | Admin | Delete parking |

### Car Entries (`/api/car-entries`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Any auth | Register car entry → generates ticket |
| PUT | `/:id/exit` | Any auth | Register car exit → generates bill |
| GET | `/` | Any auth | List all entries (paginated, filterable) |
| GET | `/:id` | Any auth | Get entry by ID |

### Reports (`/api/reports`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/dashboard` | Any auth | Dashboard stats |
| GET | `/outgoing?startDate=&endDate=` | Admin | Outgoing cars + total revenue |
| GET | `/entered?startDate=&endDate=` | Admin | Entered cars in period |

---

## Features Implemented

### Task 1 — Design
- ✅ Database models: User, Parking, CarEntry
- ✅ Microservices architecture (auth, parking, car-entry, reports services)
- ✅ User registration form (React frontend)

### Task 2 — Authentication
- ✅ User roles: `admin`, `parking_attendant`
- ✅ User registration with validation
- ✅ JWT authentication
- ✅ Login and signup via frontend forms

### Task 3 — Parking Management
- ✅ Register parking (code, name, spaces, location, fee/hour)
- ✅ View available parkings, spaces, fees

### Task 4 — Car Entry/Exit
- ✅ Register car entry (plate, parking code, entry datetime, exit=null, amount=0)
- ✅ Ticket generated on entry
- ✅ Register car exit — updates exitDateTime and chargedAmount
- ✅ Bill generated on exit (duration + total amount)
- ✅ Available spaces updated on every entry and exit

### Task 5 — Reports
- ✅ Outgoing cars report with total amount charged between two datetimes
- ✅ Entered cars report between two datetimes
- ✅ Dashboard with real-time stats

### Technical Requirements
- ✅ React.js frontend
- ✅ Node.js backend
- ✅ PostgreSQL database
- ✅ Swagger UI documentation at `/api-docs`
- ✅ JWT authentication and authorization
- ✅ Pagination on all list endpoints
- ✅ Winston logging (console + log files)
- ✅ Input validation (express-validator)
- ✅ Exception handling (global error handler)
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Rate limiting (200 req / 15 min)
- ✅ Responsive UI
