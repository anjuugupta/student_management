# tudent Management System (Full-Stack)

A complete, full-stack Student Management System built as part of a Technical Assessment Task for the **Junior Full Stack Developer** role. This project demonstrates responsive frontend form management, modular backend architecture, and transactional database constraints using PostgreSQL.

## Core Objectives Met
- **Full CRUD Support**: Add, view, edit, and safely drop student records.
- **Auto-Generated Unique Admission Keys**: Implemented via a custom PostgreSQL database trigger (Format: `ADM-[YEAR]-[SEQUENCE]`).
- **File System Avatar Uploads**: Native image handling and multi-part text formatting parsed via Multer.
- **Bonus Implementations**:
  - **Dynamic Server-Side Pagination**: Optimised API calls with metadata payload structures.
  - **Live Search & Index Filtering**: Instant lookup targeting name strings and department branches.
  - **Activity Auditing Logs**: Backend console operations logging transactional timestamps.

---

## Technology Stack

- **Frontend**: React (Vite Engine), Tailwind CSS v4, Lucide React Icons, Axios Client.
- **Backend**: Node.js, Express.js REST Framework.
- **Database**: PostgreSQL (Relational Database Service).

---



## Local Deployment Setup Guide

### 1. Database Creation
Connect to your local PostgreSQL terminal instance and execute:
```sql
CREATE DATABASE student_management;
```
*(Execute the schema setup scripts found in your documentation folder to initiate the table structures, indexes, and custom admission sequences/triggers).*

### 2. Backend Installation & Start
Navigate to the server workspace and initialize environment settings:
```bash
cd backend
npm install
```
Create a `.env` configuration file inside the `backend/` directory:
```env
PORT=5000
DB_USER=your_postgres_username
DB_HOST=localhost
DB_NAME=student_management
DB_PASSWORD=your_postgres_password
DB_PORT=5432
NODE_ENV=development
```
Launch the live development server:
```bash
npm run dev
```

### 3. Frontend Installation & Start
Open a separate execution terminal shell window and host the UI:
```bash
cd frontend
npm install
npm run dev
```
Open your browser window to `http://localhost:5173` to test the live workspace app.

---

## Core Backend API Documentation

| HTTP Method | API Endpoint Route | Functional Action | Target Payload Context |

| **GET** | `/api/students` | Fetch Students List | Supports queries `?page=1&search=Name&course=IT` |
| **GET** | `/api/students/:id` | Fetch Specific Record | Returns unique student attributes array |
| **POST** | `/api/students` | Register New Profile | Handles `multipart/form-data` with photo file |
| **PUT** | `/api/students/:id` | Modify Existing Profile | Updates fields and updates the `updated_at` token |
| **DELETE** | `/api/students/:id` | Drop Student Profile | Purges entity matching the request parameter ID |

---

##  Validation Matrix Rules
- **Name**: Mandatory string. Maximum length capped at 100 characters.
- **Course**: Drop-down verification check. Must map to valid institutional tracks (`IT`, `Computer Science`, `Electronics`).
- **Year**: Explicit numeric constraints between 1 and 4.
- **Mobile Number**: Normalized validation checking for standard structural digit lengths (10–15 digits).
- **Email Domain**: Unique verification constraints checking for proper address formats (`example@domain.com`).
