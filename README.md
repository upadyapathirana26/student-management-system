# Student Management System (SMS) 🎓

A comprehensive full-stack web application designed to streamline academic administration. This system facilitates seamless interaction between administrators and students, allowing for efficient course enrollment, real-time progress tracking, and secure data management.

## 🚀 Live Demo
> *Since this is a local development environment, please see the "How to Run Locally" section below. A video demo can be provided upon request.*

## 🛠️ Tech Stack

| Component | Technologies Used |
| :--- | :--- |
| **Frontend** | Next.js 14, React, TypeScript, Tailwind CSS, Axios |
| **Backend** | Spring Boot 3, Java 17, Spring Security, JWT |
| **Database** | Supabase (PostgreSQL) |
| **ORM** | Spring Data JPA / Hibernate |
| **Testing** | Postman (Collection & Environments) |
| **Tools** | IntelliJ IDEA, VS Code, Git |

## ✨ Key Features

### 🔐 Security & Authentication
- **JWT Authentication:** Secure stateless authentication using JSON Web Tokens.
- **Role-Based Access Control (RBAC):** Distinct dashboards and permissions for **Administrators** and **Students**.
- **Protected Routes:** Backend endpoints secured via Spring Security filters.

### 📝 Core Functionality
- **Student Management:** Full CRUD operations (Create, Read, Update, Delete) for student records.
- **Course Catalog:** Administrators can manage courses with images, descriptions, and credits.
- **Enrollment System:** Many-to-Many relationship allowing students to enroll in multiple courses.
- **Dynamic Dashboards:** 
  - **Admin:** Overview analytics, student management, course catalog.
  - **Student:** View enrolled courses, personal profile, and system info.

### ✅ Validation & Error Handling
- **Dual-Layer Validation:** Checks on both Frontend (instant feedback) and Backend (security safety net).
- **Global Exception Handling:** Centralized error management returning user-friendly messages instead of stack traces.
- **Responsive Design:** Fully responsive UI working seamlessly on Mobile, Tablet, and Desktop.

## 🚀 How to Run Locally

### Prerequisites
Before running this project, ensure you have installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Java JDK](https://adoptium.net/) (v17 or higher)
- [Maven](https://maven.apache.org/) (usually included with IntelliJ)
- A [Supabase](https://supabase.com/) account (for PostgreSQL database)

### 1. Database Setup
1. Create a new project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** and run your schema creation scripts (Users, Students, Courses, Enrollments tables).
3. Copy your **Database URL** and **Password**.

### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend