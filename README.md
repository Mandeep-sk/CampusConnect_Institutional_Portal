# CampusConnect – Institutional Event & Notice Board (MERN Stack)

A comprehensive, production-grade MERN stack web application engineered for colleges and universities to manage institutional events, student registrations, departmental announcements, and administrative approval workflows.

---

## 🌟 Key Features

### 1. Public Portal & Landing Page
- **Hero & Campus Calendar**: Live counters for students, events, and notices fetched dynamically from MongoDB.
- **Event Catalog**: Filter by category (`Technical`, `Cultural`, `Sports`, `Workshop`, `Seminar`, `Competition`, `Other`) and search by keyword or venue.
- **Real-Time Seat Tracking**: Live visual capacity progress bar indicating registered seats vs. maximum allowed capacity.
- **Official Notice Board**: Category and priority filtering (`Urgent`, `Important`, `Normal`) with pulsing alerts on urgent announcements.

### 2. Multi-Role Authentication & Security
- **Role-Based Access Control (RBAC)**: Dedicated workspaces for `Admin`, `Faculty`, and `Student`.
- **Protected Public Registration**: Public registration strictly allows `Student` or `Faculty` roles. Administrator accounts can only be created via seeder or existing admins.
- **Password Protection**: Passwords salted and hashed with `bcryptjs`.
- **JWT Authorization**: Secure JSON Web Tokens with route guards on backend APIs and frontend pages.

### 3. Administrator Dashboard
- **5 KPI Metrics**: Total Students, Total Faculty, Total Events, Total Notices, and Pending Approvals.
- **Event Moderation Queue**: One-click approval pipeline for faculty event proposals, with rejection feedback messaging.
- **User Management**: View all registered campus members, filter by role/department, and remove accounts with confirmation dialogs.
- **Notice Management**: Full CRUD capabilities for institutional circulars.

### 4. Faculty Dashboard
- **Event Submission**: Propose new departmental events with dates, venue, capacity limits, and deadlines (routed to admin for clearance).
- **Attendee Roster**: Live roster viewing the exact names, roll numbers, emails, and contact details of enrolled students.
- **Direct Notice Publishing**: Direct publication of departmental circulars to the campus board.
- **Approval Tracking**: Status tags (`Approved`, `Pending`, `Rejected`) with admin feedback.

### 5. Student Dashboard
- **Personalized Overview**: Enrolled events, upcoming calendar highlights, and urgent circular alerts.
- **One-Click Event Registration**: Automatic capacity verification, duplicate prevention, and deadline checking.
- **Seat Cancellation**: Cancel registrations anytime to free up seats for peers.
- **In-App Notification Center**: Unread notification counter with immediate alerts when new events are published or registrations succeed.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router DOM v6, Axios, Lucide React Icons, React Hot Toast |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose ODM, JSON Web Tokens (JWT), bcryptjs, dotenv, CORS |
| **Architecture** | RESTful API, Modular Controller-Service-Model architecture |

---

## 📁 Project Directory Structure

```text
CampusConnect/
│
├── client/                     # Frontend React (Vite + Tailwind CSS)
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Sidebar, Footer, Cards, Badges, Modals)
│   │   ├── context/            # Global state (AuthContext, NotificationContext)
│   │   ├── layouts/            # MainLayout (Public) & DashboardLayout (Auth)
│   │   ├── pages/
│   │   │   ├── admin/          # Admin Dashboard, Users, Events, Approvals, Notices, Profile
│   │   │   ├── faculty/        # Faculty Dashboard, My Events, Create Event, Notices
│   │   │   ├── student/        # Student Dashboard, Browse, My Registrations, Notifications
│   │   │   └── public/         # Landing, Events, EventDetails, Notices, Login, Register
│   │   ├── services/           # Axios API configuration & interceptors
│   │   ├── App.jsx             # Route definitions & protection
│   │   ├── index.css           # Tailwind directives & styles
│   │   └── main.jsx            # React root mount
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Backend Node.js & Express.js
│   ├── config/                 # MongoDB database connection & memory fallback
│   ├── controllers/            # Auth, User, Event, Notice, Registration, Notification, Dashboard
│   ├── middleware/             # JWT auth protection, role authorization, error handling
│   ├── models/                 # Mongoose schemas (User, Event, Notice, EventRegistration, Notification)
│   ├── routes/                 # REST API endpoints
│   ├── seeders/                # Database seeder (seed.js)
│   ├── utils/                  # JWT token generator, in-app notification dispatcher
│   ├── .env.example            # Environment template
│   ├── .env                    # Active environment configuration
│   ├── package.json
│   ├── server.js               # Express application entry point
│   └── testApi.js              # Automated backend test suite
│
├── package.json                # Root scripts & concurrently orchestrator
├── start.bat                   # 1-Click launcher for Windows
├── setup.bat                   # 1-Click dependency installer & seeder
├── .gitignore
└── README.md                   # Documentation
```

---

## 🔑 Demo Login Credentials

The project comes pre-seeded with realistic institutional demo accounts:

| Role | Email Address | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@campusconnect.com` | `Admin@123` | Full administrative control, user moderation, event approval queue |
| **Faculty Member** | `faculty@campusconnect.com` | `Faculty@123` | Create events, view attendee rosters, post notices directly |
| **Student Scholar** | `student@campusconnect.com` | `Student@123` | Register for events, cancel seats, view circulars, receive alerts |

*(Note: The login page includes 1-click autofill buttons to immediately load any of these accounts.)*

---

## ⚙️ Environment Variables (`server/.env`)

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/campusconnect
JWT_SECRET=campusconnect_super_secret_jwt_key_2026_secure_token
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 🗄️ MongoDB Setup Options

1. **Local MongoDB (Default)**:
   Ensure your local MongoDB community server or Windows service is active.
   `MONGO_URI=mongodb://127.0.0.1:27017/campusconnect`

2. **MongoDB Atlas (Free Cloud Cluster)**:
   - Create a free cluster at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
   - In Database Access, create a user and password.
   - In Network Access, allow IP `0.0.0.0/0` (allow from anywhere).
   - Update `server/.env` with your connection string:
     `MONGO_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/campusconnect?retryWrites=true&w=majority`

3. **In-Memory Development Fallback**:
   The backend includes an automatic fallback runner (`mongodb-memory-server`) that spins up a real in-memory MongoDB instance if local MongoDB port 27017 is unavailable during initial testing.

---

## 🚀 Quick Start Guide

### Option 1: 1-Click Launcher (Windows)
Double-click `start.bat` in the project root. It will:
1. Verify and install any missing dependencies automatically.
2. Launch the backend server on `http://localhost:5000`.
3. Launch the React Vite frontend on `http://localhost:5173`.

### Option 2: Command Line (Step-by-Step)

#### Step 1: Install Dependencies
```bash
# In the project root:
npm install

# In the server folder:
cd server
npm install

# In the client folder:
cd ../client
npm install
cd ..
```

#### Step 2: Seed the Database
```bash
npm run seed
# or: node server/seeders/seed.js
```

#### Step 3: Run the Application
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- Health Check: `http://localhost:5000/api/health`

---

## 📡 RESTful API Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new Student or Faculty member (Admins blocked).
- `POST /api/auth/login` - Authenticate user & receive JWT token.
- `GET /api/auth/me` - Retrieve current authenticated profile (Protected).
- `PUT /api/auth/profile` - Update profile information (Protected).

### Users (`/api/users`)
- `GET /api/users` - Retrieve all registered campus users (Admin only).
- `GET /api/users/:id` - Retrieve user by ID (Admin or Self).
- `DELETE /api/users/:id` - Delete user account & cascade clear registrations (Admin only).

### Events (`/api/events`)
- `GET /api/events` - Retrieve events with category, search, and status filters (Public sees Approved; Admin sees all).
- `GET /api/events/:id` - Retrieve single event details.
- `POST /api/events` - Submit a new event (Admin publishes immediately; Faculty requires approval).
- `PUT /api/events/:id` - Update event details (Admin or creator).
- `DELETE /api/events/:id` - Delete event and remove registrations (Admin or creator).
- `PUT /api/events/:id/approve` - Approve event proposal (Admin only).
- `PUT /api/events/:id/reject` - Reject event proposal with custom feedback reason (Admin only).

### Notices (`/api/notices`)
- `GET /api/notices` - Retrieve institutional circulars with priority and category filters.
- `GET /api/notices/:id` - Retrieve single notice circular.
- `POST /api/notices` - Broadcast notice to campus (Faculty or Admin).
- `PUT /api/notices/:id` - Update notice (Admin or creator).
- `DELETE /api/notices/:id` - Delete notice (Admin or creator).

### Event Registrations (`/api/registrations`)
- `POST /api/registrations/:eventId` - Register student for an approved event (Student only).
- `GET /api/registrations/my` - List student's enrolled events (Student only).
- `GET /api/registrations/event/:eventId` - View registered student roster (Admin or Faculty creator).
- `DELETE /api/registrations/:id` - Cancel seat registration (Student or Admin).

### Notifications (`/api/notifications`)
- `GET /api/notifications` - Retrieve in-app notifications and unread counter.
- `PUT /api/notifications/:id/read` - Mark single notification as read.
- `PUT /api/notifications/read-all` - Mark all notifications as read.

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard/stats` - Role-aware statistics tailored for Admin, Faculty, or Student.

---

## 🧪 Testing Suite
To execute the automated API verification suite:
```bash
cd server
npm test
# or: node testApi.js
```
Runs comprehensive assertions across authentication, event approval queues, duplicate registration prevention, capacity decrementing, and role-based access control.

---

## 🎓 Academic Lab Submission Note
Designed and developed for College Full-Stack MERN Engineering Laboratories, adhering strictly to clean code practices, role-based architectural separation, and responsive UI standards.
