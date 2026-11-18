# Community Library Management System

This project is a full-stack library management system for the BIWA2110 Web Application Development assignment. It uses a React frontend, an Express backend and a MySQL database.

## Technologies Used

- React
- React Router
- JavaScript and JSX
- CSS
- Fetch API
- Node.js
- Express.js
- MySQL
- mysql2

## Step 1 Create the MySQL Database

1. Open MySQL Workbench.
2. Open the file `backend/database/schema.sql`.
3. Run the complete SQL script.
4. The script creates the `community_library` database and the tables for books, users and transactions.
5. It also creates the first administrator account.

## Step 2 Set Up the Backend

Open PowerShell inside the project folder and enter:

powershell
cd backend
npm.cmd install
Copy-Item .env.example .env

Open `backend/.env` and change `DB_PASSWORD` to your MySQL password.

Start the backend:

powershell
npm.cmd run dev


The backend runs at `http://localhost:5000`.

Test the connection by opening:

text
http://localhost:5000/api/health


## Step 3 Set Up the Frontend

Open a second PowerShell window inside the project folder and enter:

powershell
cd frontend
npm.cmd install
npm.cmd run dev


Open the local address displayed by Vite, normally:

text
http://localhost:5173


## Administrator Login

Use this membership ID:

mosh1234


## REST API Routes

### Books

- `GET /api/books`
- `POST /api/books`
- `PUT /api/books/:id`
- `DELETE /api/books/:id`

### Transactions

- `GET /api/transactions`
- `POST /api/transactions`

### Users

- `GET /api/users`
- `POST /api/users/login`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

## Data Storage

Books, users and transaction records are stored in MySQL. Session Storage only remembers the currently logged-in user while the browser tab is open.
