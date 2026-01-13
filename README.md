# Todo App with ABAC (Attribute-Based Access Control)

A modern, full-stack Todo application built to demonstrate advanced access control logic where permissions are derived from both User Roles and Resource Attributes.

## 🚀 Quick Intro

This project was built for the Intern Software Engineer take-home test. The core challenge was implementing a simplified ABAC model. Unlike standard Role-Based Access Control (RBAC), this app evaluates the status of a todo (an attribute) before allowing a standard user to delete it, while allowing Administrative roles broader permissions.

## 🛠️ Tech Stack

- Framework: Next.js 15 (App Router)
- UI Components: shadcn/ui (Radix UI + Tailwind CSS)
- Authentication: Better Auth
- Database & ORM: PostgreSQL (Neon.tech) with Drizzle ORM
- State Management: TanStack Query (React Query)
- Deployment: Vercel

## ✨ Key Features & ABAC Logic

The application enforces a strict permission matrix as defined in the technical requirements:  
|Role | View Todos | Create | Update | Delete |
|---|---|---|---|---|
|User |Own Only | Yes | Yes | Drafts Only |
|Manager | All | No | No | No |
|Admin | All | No | No | Any |

- Dynamic UI: Buttons and forms are conditionally rendered based on the user's role and the specific todo's state.
- Server-Side Security: ABAC logic is enforced at the Server Action level to prevent unauthorized API manipulation.
- Responsive Design: Fully responsive dashboard built with Tailwind CSS.

## ⚙️ Installation & Local Setup

1. Clone the repository:

```bash
clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

2. Install dependencies:

```bash
npm install
```

3. Environment Variables:  
   Create a .env.local file in the root and add the following:

```bash
DATABASE_URL="your_neon_postgres_url"
BETTER_AUTH_SECRET="a_random_long_string"
BETTER_AUTH_URL="http://localhost:3000"
```

4. Database Migration:  
   Push the schema to your Neon database:

```bash
npx drizzle-kit push
```

5. Run the development server:

```bash
npm run dev
```

6. Open http://localhost:3000 to see the result.

## 🌐 Deployment

The application is deployed on Vercel and connected to a live Neon PostgreSQL instance.

- Live Demo: https://todo-rmz.vercel.app
- Database: Hosted on Neon.tech

Developed by **Mohammadh Rimaz**
