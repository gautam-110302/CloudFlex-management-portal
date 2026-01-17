# CloudFlex - Multi-Tenant Project Management Portal

A full-stack project management application with client-level data isolation and robust Role-Based Access Control (RBAC).

## ✨ Features
- **Multi-Tenancy**: Users are automatically assigned to a company based on their email domain upon registration.
- **RBAC (Global)**: Separate permissions for `Admin` and `Member` roles.
- **Project Roles**: Assign users to specific projects as `Owner`, `Developer`, or `Viewer`.
- **Stateless Auth**: Secure JWT-based authentication system.

## 🛠️ Tech Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS
- **Backend**: NestJS, TypeORM (PostgreSQL)
- **Validation**: Class-validator & DTOs

## 🗄️ Database Schema
The system manages 4 core tables:
1. `clients`: Company metadata.
2. `users`: User profiles and global roles.
3. `projects`: Project details.
4. `project_users`: Join table for project-specific assignments and roles.

## 🚀 Getting Started

### 1. Backend Setup
1. `cd backend`
2. `npm install`
3. Create a `.env` file based on `.env.example`:
   ```text
   DATABASE_URL=postgresql://user:password@localhost:5432/cloudflex_db
   JWT_SECRET=your_secret_key
   PORT=3001