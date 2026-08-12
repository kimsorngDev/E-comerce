E-Commerce V1

A simple e-commerce web application focused on product showcase, product management, and user management.

Project Overview

E-Commerce V1 is an 8-week project developed by a 2-person team.

The main goal of V1 is to provide:

A public product showcase
Product and category management
User authentication
Admin and Staff roles
User management for Admin
Responsive design for mobile and desktop

The project does not include cart, checkout, payment, stock management, delivery tracking, or reports in V1.

Team
Member 1 — Frontend
Member 2 — Backend
Working Capacity
2 people
1 hour/day/person
Monday–Friday
Approximately 10 person-hours/week
8 weeks
Approximately 80 person-hours total
Tech Stack
Frontend
Next.js
React
TypeScript
Tailwind CSS
Backend
Next.js server-side functionality
Prisma
Database
PostgreSQL
Supabase or Neon
Authentication
Auth.js
Image Storage
Supabase Storage
Deployment
Vercel
Development Tools
GitHub
GitHub Issues
User Roles
Visitor

Visitors do not need an account.

They can:

Browse products
Search products
Filter products by category
View product details
Staff

Staff can:

Log in
Manage products
Manage categories
Upload product images
Activate/deactivate products

Staff cannot manage users.

Admin

Admin can:

Log in
Manage products
Manage categories
Manage users
Create Staff accounts
Edit Staff accounts
Delete Staff accounts
Assign roles
V1 Features
Public Storefront
Homepage
Product listing
Product detail page
Product search
Category filtering
Pagination
Responsive design
Product Management
Create product
Edit product
Delete product
Upload product images
Assign category
Set product status
Active/inactive products
Category Management
Create category
Edit category
Delete category
Assign products to categories
User Management
Login
Logout
User list
Create Staff
Edit Staff
Delete Staff
Assign roles
Project Structure
e-commerce/
├── app/
│   ├── page.tsx
│   ├── login/
│   ├── products/
│   └── admin/
│       ├── page.tsx
│       ├── products/
│       ├── categories/
│       └── users/
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── product/
│
├── lib/
│
├── prisma/
│   └── schema.prisma
│
├── public/
│
├── .env.local
├── .gitignore
├── package.json
└── README.md
Database

V1 uses three main models:

User
Category
Product
User
id
name
email
passwordHash
role
createdAt
updatedAt
Category
id
name
createdAt
updatedAt
Product
id
name
description
price
imageUrl
status
categoryId
createdAt
updatedAt
Roles
ADMIN
STAFF
Product Status
ACTIVE
INACTIVE
Relationship
Category
   │
   │ 1
   │
   │ N
   ▼
Product
Development Plan
Week 1 — Foundation & Setup
Member 1
Set up Next.js
Set up TypeScript
Set up Tailwind
Create public layout
Create admin layout
Create header/footer/navigation
Create basic product grid
Member 2
Set up PostgreSQL
Set up Prisma
Create database schema
Create migration
Create seed data
Both
Create GitHub repository
Define V1 requirements
Set up Git workflow
Verify local development environment
Week 2 — Authentication
Member 1
Build login page
Build login form
Add validation
Add error/loading states
Add logout UI
Member 2
Configure Auth.js
Implement authentication
Implement password hashing
Implement sessions
Implement Admin/Staff roles
Protect routes
Both
Test Admin login
Test Staff login
Test logout
Test unauthorized access
Week 3 — User Management
Member 1
Build user list
Build create user form
Build edit user form
Build role selection
Build delete confirmation
Member 2
Build user CRUD
Add validation
Add password hashing
Add Admin-only authorization
Both
Test Admin creating Staff
Test Staff login
Test role restrictions
Week 4 — Product & Category Backend
Member 1
Build product table
Build product list
Add create/edit/delete controls
Start category interface
Member 2
Build Product CRUD
Build Category CRUD
Add validation
Add authorization
Add product/category relationship
Add product status
Both
Test CRUD end-to-end
Week 5 — Product Management
Member 1
Build product create form
Build product edit form
Add image selection
Add category selection
Add status selection
Add validation
Member 2
Implement image upload
Configure Supabase Storage
Store image URLs
Validate uploaded files
Improve API error handling
Both
Test complete product lifecycle
Week 6 — Product Showcase
Member 1
Build homepage
Build product grid
Build product cards
Build product detail page
Build category navigation
Make storefront responsive
Member 2
Build public product API
Add active-product filtering
Add category filtering
Add search
Add pagination
Both
Connect storefront to backend
Test product browsing
Week 7 — Search, Filter & Responsive Quality
Member 1
Complete search UI
Complete category filter
Improve responsive layout
Improve mobile navigation
Add loading states
Add empty states
Add error states
Member 2
Improve search queries
Improve filtering
Improve pagination
Add database indexes where needed
Review validation and security
Both
Test mobile
Test tablet
Test desktop
Test Visitor, Staff, and Admin workflows
Week 8 — QA & Deployment
Both
Full system testing
Fix critical bugs
Test authentication
Test user management
Test product management
Test storefront
Member 1
Final UI fixes
Responsive testing
Browser testing
Favicon/branding
Basic accessibility/usability check
Member 2
Configure production database
Configure production environment variables
Run production migration
Configure image storage
Deploy to Vercel
Verify production authentication and database
Both
Final production walkthrough
Update documentation
Remove debug code
Release V1
Git Workflow

Keep the Git workflow simple.

main
 │
 ├── feature/frontend-foundation
 │
 ├── feature/database-foundation
 │
 └── feature/product-management

Basic workflow:

Create Issue
    ↓
Create Branch
    ↓
Develop
    ↓
Test
    ↓
Pull Request
    ↓
Review
    ↓
Merge
Guidelines
Keep issues small.
One issue should ideally be completed within 1–3 working sessions.
Make small commits.
Merge frequently.
Avoid long-lived branches.
Do not commit secrets or .env.local.
Environment Variables

Create a .env.local file locally.

Example:

DATABASE_URL="your-postgresql-connection-string"

AUTH_SECRET="your-auth-secret"

SUPABASE_URL="your-supabase-url"

SUPABASE_ANON_KEY="your-supabase-anon-key"

Never commit .env.local to GitHub.

Local Development

Install dependencies:

npm install

Run the development server:

npm run dev

Open:

http://localhost:3000

Run Prisma migration:

npx prisma migrate dev

Seed the database:

npx prisma db seed
V1 Definition of Done

V1 is complete when:

 Public storefront works
 Products can be browsed
 Products can be searched
 Products can be filtered
 Product details work
 Admin login works
 Staff login works
 Admin can manage Staff
 Admin can manage products
 Staff can manage products
 Categories work
 Product images work
 Active/inactive status works
 Mobile layout works
 Desktop layout works
 Production database works
 Production application is deployed
 Public URL is available
Out of Scope — Phase 2

The following features are intentionally excluded from V1:

Shopping cart
Checkout
Payment integration
Stock management
Purchase orders
Order management
Delivery tracking
Customer order history
Sales reports
Stock reports
Advanced analytics

These features will be planned separately after V1 is released.

Project Principle

The main goal is to finish a small, stable, usable V1 within the available 80 person-hours.