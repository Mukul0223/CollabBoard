# CollabBoard — Real-Time Kanban Application

CollabBoard is a production-ready, real-time Kanban project management application built with **React, Node.js, Socket.IO, and MongoDB**. It provides fluid drag-and-drop task management, real-time multi-user collaboration, and customizable card details.

---

## 🛠 Tech Stack

* **Frontend:** React (Vite), Zustand, Tailwind CSS, Axios, Socket.IO Client, `@hello-pangea/dnd`
* **Backend:** Node.js, Express, Socket.IO, JWT Authentication, bcryptjs
* **Database:** MongoDB Atlas with Mongoose
* **Deployment:** Vercel (Frontend) and Render (Backend)

---

## ✨ Key Features

* **Fluid Drag-and-Drop:** Interactive card and list reordering with optimistic UI updates and immediate database persistence.
* **Real-Time Collaboration:** Powered by WebSockets with Socket.IO. Board changes, task movements, and newly added cards are synchronized across connected users in real time.
* **Card Detail Management:** Dedicated modal for managing task descriptions, custom labels/tags, and due dates.
* **Authentication & Security:** JWT-based authentication with protected routes and secure password hashing using bcryptjs.
* **Board Membership & Access Control:** Supports board ownership, member invitations via email, and automatic user redirection when a board is deleted.

---

## 📂 Repository Structure

The project is organized as a unified monorepo with a clean separation between the frontend and backend:

```text
collabboard/
├── client/                         # Frontend React application
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Navbar
│   │   │   ├── Modal
│   │   │   ├── List
│   │   │   └── Card
│   │   ├── pages/                  # Application pages
│   │   │   ├── LoginPage
│   │   │   ├── RegisterPage
│   │   │   ├── DashboardPage
│   │   │   └── BoardPage
│   │   ├── services/               # API and Socket.IO communication
│   │   ├── store/                  # Zustand global state management
│   │   └── App.jsx                 # Routing and application layout
│   ├── vercel.json                 # Vercel deployment configuration
│   └── package.json
│
├── server/                         # Backend REST API and Socket.IO server
│   ├── config/                     # Database and server configuration
│   ├── controllers/                # Request handlers
│   ├── middleware/                 # Authentication and error handling
│   ├── models/                     # Mongoose schemas
│   │   ├── User
│   │   ├── Board
│   │   ├── List
│   │   └── Card
│   ├── routes/                     # Express API routes
│   ├── index.js                    # Express and Socket.IO entry point
│   └── package.json
│
└── README.md
```

---

## 💻 Local Development Setup

### 1. Prerequisites

Before running CollabBoard locally, make sure you have:

* **Node.js v18 or higher**
* **npm** or **Yarn**
* A **MongoDB** database, either a local MongoDB instance or a MongoDB Atlas cluster

---

### 2. Clone the Repository

```bash
git clone https://github.com/mukul0223/collabboard.git
cd collabboard
```

---

### 3. Install Server Dependencies

```bash
cd server
npm install
```

---

### 4. Install Client Dependencies

```bash
cd ../client
npm install
```

---

### 5. Configure Environment Variables

Create a `.env` file in the `server` directory and add the required environment variables.

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Then create a `.env` file in the `client` directory if your frontend requires environment-specific configuration.

Example:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

> **Important:** Never commit `.env` files or secret keys to your repository.

---

### 6. Start the Backend

From the `server` directory:

```bash
npm run dev
```

The backend will start on the configured port, typically:

```text
http://localhost:5000
```

---

### 7. Start the Frontend

Open a second terminal and run:

```bash
cd client
npm run dev
```

The Vite development server will typically be available at:

```text
http://localhost:5173
```

---

## 🚀 Production Deployment

CollabBoard can be deployed using:

* **Frontend:** Vercel
* **Backend:** Render
* **Database:** MongoDB Atlas

Make sure the production environment variables are configured correctly on both Vercel and Render.

For Socket.IO to work correctly in production, ensure the frontend's Socket.IO URL points to the deployed backend and that the backend allows requests from the deployed frontend domain.

---

## 🔐 Authentication

CollabBoard uses **JWT-based authentication** to protect private routes and API endpoints.

Passwords are securely hashed using **bcryptjs**, while authenticated requests are validated through backend middleware.

---

## 🤝 Real-Time Collaboration

Real-time synchronization is handled using **Socket.IO**.

When a user performs an action such as:

* Creating a card
* Moving a card
* Reordering a list
* Updating card details
* Adding or removing board members

the server broadcasts the relevant changes to other connected users on the board.

This allows multiple users to collaborate on the same Kanban board without manually refreshing the page.

---

## 📄 License

This project is available under the **MIT License**.
