# Daybook

Daybook is a full-stack expense tracking application built with the MERN stack. It allows users to keep track of their personal expenses and manage shared expenses with other users through rooms.

The project was built to provide a simple way to record expenses, organize them by category, and manage shared spending in one place.

## Features

* User registration and login
* JWT-based authentication
* Create, update, and delete personal expenses
* Categorize and date expenses
* View personal expense history
* Create shared expense rooms
* Add users to a room
* Create and manage room expenses
* Split an expense equally between room members
* Admin and member permissions
* Progressive Web App (PWA) support
* Responsive interface for desktop and mobile

## Tech Stack

**Frontend**

* React
* Vite
* React Router
* Axios
* Tailwind CSS

**Backend**

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt

**Deployment**

* Vercel — Frontend
* Render — Backend
* MongoDB Atlas — Database

## Project Structure

```text
Daybook/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── index.js
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

* Node.js
* npm
* MongoDB or a MongoDB Atlas account

### Clone the repository

```bash
git clone <your-repository-url>
cd Daybook
```

### Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
secret=your_jwt_secret
```

Start the backend:

```bash
npm run dev
```

### Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

## Authentication

Daybook uses JSON Web Tokens (JWT) for authentication.

After login, the server returns a token that is used to authenticate protected API requests.

Passwords are securely hashed using bcrypt before being stored in the database.

## Room Expenses

The room feature is designed for shared spending.

A room administrator can add users to a room. Members can then create expenses and optionally split them between selected members.

For example, if a Rs. 1,000 expense is split between four members, each member's share will be Rs. 250.

Room permissions are handled on the backend to ensure that users can only modify or delete expenses they are allowed to manage.

## API

The backend exposes REST APIs for authentication, personal expenses, and room management.

Main endpoints include:

```text
POST   /api/signup
POST   /api/login

POST   /api/expenses
GET    /api/expenses
PUT    /api/expenses/:id
DELETE /api/expenses/:id

POST   /api/rooms
GET    /api/rooms/my-room
GET    /api/rooms/:roomId

POST   /api/rooms/:roomId/members

POST   /api/rooms/:roomId/expenses
GET    /api/rooms/:roomId/expenses
PUT    /api/rooms/:roomId/expenses/:expenseId
DELETE /api/rooms/:roomId/expenses/:expenseId
```

## Environment Variables

Do not commit your `.env` file to the repository.

Add the following to `.gitignore`:

```gitignore
node_modules
.env
```

## Deployment

The application is deployed using:

* **Frontend:** Vercel
* **Backend:** Render
* **Database:** MongoDB Atlas

Live application:

**https://day-book-eta.vercel.app**

## Future Improvements

Some features planned for future versions include:

* Expense analytics and charts
* Monthly reports
* Budget tracking
* Export expenses
* Recurring expenses
* Improved room management
* Notifications

## Author

**Aayush Shrestha**

GitHub: https://github.com/Aayushstha10

## License

This project is for learning and personal use.
