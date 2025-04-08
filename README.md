# Timely

Timely is a comprehensive platform designed to streamline calendar management, group interactions, and saving plans. Built with modern frontend and backend technologies, the project lays a robust foundation with a focus on responsiveness, security, and scalability. It delivers a functional experience for managing user calendars, groups, and financial plans, integrating essential third-party APIs for added functionality.

## 📑 Table of Contents

- [Showcase](#showcase)
- [Built With](#built-with)
- [Starting Server](#starting-server)
- [Authentication & Users](#authentication--users)
- [Core Features](#core-features)
- [Frontend Overview](#frontend-overview)
- [Backend Overview](#backend-overview)
- [Client Folder Structure](#client-folder-structure)
- [Server Folder Structure](#server-folder-structure)
- [Networking & VPC](#networking--vpc)
- [DeepSeek Chatbot Integration](#deepseek-chatbot-integration)

---

## 🚀 Showcase

A demo video and screenshots are available showcasing the core features including:

- Calendar management with event creation, editing, and viewing
- Group collaboration through shared calendars
- Saving plans with easy-to-track financial progress
- Pre-made event templates (e.g., Wedding, Party) ready to customize

---

## 🛠️ Built With

- ![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white&style=flat-square)
- ![React](https://img.shields.io/badge/React-blue?logo=react&logoColor=white&style=flat-square)
- ![Redux](https://img.shields.io/badge/Redux-764ABC?logo=redux&logoColor=white&style=flat-square)
- ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=flat-square)
- ![Node.js](https://img.shields.io/badge/Node.js-green?logo=node.js&logoColor=white&style=flat-square)
- ![Express.js](https://img.shields.io/badge/Express.js-gray?logo=express&logoColor=white&style=flat-square)
- ![AWS](https://img.shields.io/badge/AWS-232F3E?logo=amazon-aws&logoColor=white&style=flat-square)
- ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white&style=flat-square)

[🔝 Back to top](#timely)

---

## 🔐 Authentication & Users

Timely employs secure user authentication using services like AWS Cognito or OAuth for safe login and user management. Key features include:

- **User Registration**: Secure account creation with email/password credentials.
- **User Sign-In**: Authentication that verifies user identities.
- **Session Management**: Secure handling of user sessions for seamless interactions.

[🔝 Back to top](#timely)

---

## ✨ Core Features

This section outlines the project's current features, covering both the frontend (what users see and interact with) and the backend (the behind-the-scenes system that handles data and logic).

### Frontend

- **What it does**: The frontend is the interface users interact with. It allows users to:
    - Manage their Calendar (create, edit, and view events).
    - Work with Groups (interact with shared calendars or plans for a group of people).
    - Set up and monitor Saving Plans (track financial goals or progress).
- **Design priorities**:
    - **Responsiveness**: Ensures the interface looks and works smoothly across both desktop and mobile devices, with extra attention to mobile usability.
    - **Templates feature**: Includes pre-made event layouts like "Wedding" that users can customize (e.g., add details for "Food," "Host," "Participants").
    - **Technical base**: The frontend is built using modern frameworks (Next.js, React) to keep the web-app lightweight, fast, and scalable.

### Backend

- **What it does**: Acts as the brain of the platform, ensuring the frontend works seamlessly by:
    - Handling data requests (saving or retrieving user data).
    - Managing user authentication securely (e.g., logging in and verifying users).
    - Interacting with the database to store and fetch information about calendars, templates, groups, and saving plans.
- **Security**:
    - User authentication uses secure services like AWS Cognito or OAuth.
    - Data is stored safely using cloud-based database solutions like AWS RDS.

### Cloud Computing

- **Why it's used**: To ensure the app is scalable, always available, and capable of handling user data without performance issues.
- **Current Cloud Setup**:
    - Stores user and app data in a reliable database (AWS RDS).
    - Provides hosting for the app's backend (AWS EC2) and frontend (deployment platform like Vercel or AWS Amplify).
    - Securely manages user sessions and authentication.

### Third-party APIs

- **What they're for**: To save development time and provide essential services. The project may include:
    - Google APIs: For potential calendar syncing or map integration.
    - Authentication APIs: Like Clerk, for secure logins (if Cognito/OAuth are not used).
    - Any other APIs will only be added after consulting with the client.

### Currently Not Implemented:

- **AI features**: Generative AI or chatbot functionalities (like DeepSeek integration) are planned for the future.
- **Membership or payment systems**: These features are not part of the current implementation.

The application provides a functional, secure, and user-friendly experience with its core features operational, laying the groundwork for future enhancements.

[🔝 Back to top](#timely)

---

## 🎨 Frontend Overview

### What It Does

The frontend is the user-facing component built with Next.js and React. It allows users to:

- Manage their calendars (create, edit, view events)
- Interact with group plans and shared calendars
- Set up and monitor saving plans for financial goals

### Design Priorities

- **Responsiveness**: Optimized for desktop and mobile.
- **Templates Feature**: Pre-made customizable event layouts (e.g., "Wedding").
- **Modern Frameworks**: Built using Next.js and React for performance and scalability.

### State Management with Redux

Redux is used to centralize the app's data, making it easier to share and update information across components. States represent the current condition of the app (like user info or UI settings) and change in response to user actions or API calls.

#### `state` Folder

This folder organizes the app's state management and API integration.

1.  **`api.ts`**
    -   Manages API calls using `@reduxjs/toolkit/query`.
    -   Defines endpoints for each resource (e.g., users, groups, events).
    -   Automatically generates hooks for each API endpoint (e.g., `useGetUsersQuery`, `useCreateUserMutation`).
    -   Example: `getUsers` fetches a list of users; `createUser` sends new user data to the backend.

2.  **`index.ts`**
    -   Manages the global UI state using `createSlice`.
    -   Handles states like whether the sidebar is collapsed or if dark mode is enabled.
    -   Example: `setIsSidebarCollapsed` action toggles the sidebar state.

3.  **`interface.ts`**
    -   Defines TypeScript interfaces for data structures used throughout the frontend.
    -   Ensures type safety and alignment with the backend's Prisma schema.
    -   Example: `User` interface represents a user object (ID, name, email, etc.).

[🔝 Back to top](#timely)

---

## ⚙️ Backend Overview

### What It Does

The backend, built with Node.js and Express.js, serves as the engine of the platform by:

- Handling data requests (saving, retrieving, and manipulating user data)
- Managing authentication and session validation
- Interacting with the PostgreSQL database via the Prisma ORM

### Key Components

1.  **Prisma ORM**:
    -   An Object-Relational Mapping tool that simplifies database interactions.
    -   Provides a type-safe API for querying and manipulating the PostgreSQL database (hosted on AWS RDS).
    -   Manages database schema migrations and updates.

2.  **Controllers**:
    -   Contain the business logic for handling API requests and generating responses.
    -   Interact with Prisma to perform CRUD (Create, Read, Update, Delete) operations on the database.
    -   Keep the codebase modular by separating endpoint logic.
    -   Example: `getCalendars` fetches all calendars and related data (events, user, group); `getCalendar` fetches a specific calendar by ID.

3.  **Routes**:
    -   Map specific API endpoints (e.g., `/calendar`, `/event`) to their corresponding controller functions.
    -   Act as the entry point for API requests, directing them to the appropriate controller logic.
    -   Example: `router.get("/")` in `calendarRoutes.ts` maps to the `getCalendars` controller; `router.get("/:id")` maps to `getCalendar`.

4.  **`index.ts`**:
    -   The main entry point for the server application.
    -   Initializes the Express app, sets up middleware (like CORS, body parsing).
    -   Imports and integrates all route modules (e.g., `calendarRoutes`, `eventRoutes`).
    -   Defines the server's home route (`/`) and starts the server listening on the configured port.

### Example Route Handlers

- `POST`: Create/update events, groups, or saving plans.
- `GET`: Fetch calendars, events, and financial plans.
- `DELETE`: Remove user-related data.

[🔝 Back to top](#timely)

---

## 📁 Client Folder Structure

```bash
PlanIt/
└── client/
    ├── next                # Next.js framework files (build outputs, cache)
    ├── node_modules        # Project dependencies for the client application
    ├── public              # Static assets (images, fonts, icons) directly accessible via URL
    ├── src/
    │   ├── app/            # Core application: pages, layouts, global styles
    │   │   ├── add-template/page.tsx     # Page for adding new event templates
    │   │   ├── calendar/page.tsx         # Main calendar view page
    │   │   ├── groups/page.tsx           # Page for managing user groups
    │   │   ├── savingPlans/page.tsx      # Page for managing saving plans
    │   │   ├── settings/page.tsx         # User settings page
    │   │   ├── dashboardWrapper.tsx      # Wrapper component providing layout for dashboard pages
    │   │   ├── global.css                # Global CSS styles applied across the application
    │   │   ├── layout.tsx                # Root layout component for the application
    │   │   ├── page.tsx                  # Home page or landing page component
    │   │   ├── redux.tsx                 # Redux store setup and provider configuration
    │   ├── components/     # Reusable UI components shared across different pages
    │   │   ├── CalendarComponent/page.tsx# The main interactive calendar component
    │   │   ├── Modal/page.tsx            # Reusable modal component
    │   │   ├── Navbar/page.tsx           # Top navigation bar component
    │   │   ├── Sidebar/page.tsx          # Side navigation bar component
    │   ├── state/          # Redux state management logic and API integration
    │       ├── api.ts                    # Redux Toolkit Query API slice definition (endpoints, base query)
    │       ├── index.ts                  # Redux global state slice (e.g., UI state like dark mode)
    │       ├── interface.ts              # TypeScript interfaces defining data shapes (aligns with backend)
    ├── .env                 # Environment variables for the client (API keys, base URLs)
    ├── .eslintrc.json       # ESLint configuration for code linting rules
    ├── .prettierrc          # Prettier configuration for code formatting rules
    ├── next-env.d.ts        # TypeScript definitions for Next.js environment
    ├── next.config.ts       # Next.js framework configuration file
    ├── package-lock.json    # Exact dependency versions lockfile
    ├── package.json         # Lists client dependencies and scripts
    ├── postcss.config.mjs   # PostCSS configuration (used by Tailwind CSS)
    ├── tailwind.config.ts   # Tailwind CSS theme and plugin configuration
    ├── tsconfig.json        # TypeScript compiler options for the client
```

[🔝 Back to top](#timely)

---

## 📂 Server Folder Structure

```bash
PlanIt/
└── server/
    ├── dist                 # Compiled JavaScript output from TypeScript source
    ├── node_modules         # Project dependencies for the server application
    ├── prisma/              # Prisma ORM configuration and related files
    │   ├── migrations/      # Database migration history files generated by Prisma Migrate
    │   ├── seedData/        # JSON files containing initial data for seeding
    │   │   ├── auditLog.json
    │   │   ├── calendar.json
    │   │   └── ...          # Other seed data files
    │   ├── schema.prisma    # Prisma schema file defining database models and relations
    │   ├── seed.ts          # Script to populate the database with initial seed data
    ├── src/
    │   ├── controllers/     # Request handling logic for different resources (e.g., users, events)
    │   │   ├── calendarController.ts
    │   │   ├── eventController.ts
    │   │   └── ...          # Other controller files
    │   ├── middleware/      # Custom middleware functions (e.g., authentication, logging)
    │   ├── routes/          # API route definitions mapping endpoints to controllers
    │   │   ├── calendarRoutes.ts
    │   │   ├── eventRoutes.ts
    │   │   └── ...          # Other route definition files
    │   ├── utils/           # Utility functions shared across the server codebase
    │   ├── index.ts         # Main server entry point: initializes Express, middleware, routes
    ├── .env                 # Environment variables for the server (database URL, ports, secrets)
    ├── ecosystem.config.js  # PM2 process manager configuration for deployment
    ├── package-lock.json    # Exact dependency versions lockfile
    ├── package.json         # Lists server dependencies and scripts
    ├── tsconfig.json        # TypeScript compiler options for the server
```

[🔝 Back to top](#timely)

---

## 🌐 Networking & VPC (AWS Setup Example)

PlanIt utilizes a secure and scalable Virtual Private Cloud (VPC) setup on AWS.

-   **VPC (`pm_vpc`)**: Provides an isolated network environment.
    -   `IPv4 CIDR`: `10.0.0.0/16` (Defines the private IP address range for the VPC)
-   **Subnets**: Isolated sections within the VPC for organizing resources.
    -   **Public Subnet (`pm_public-subnet-1`)**: Resources can have direct access to the internet.
        -   `CIDR block`: `10.0.0.0/24`
        -   Typically hosts resources like the EC2 instance running the backend server.
    -   **Private Subnets (`pm_private-subnet-1`, `pm_private-subnet-2`)**: Resources do not have direct internet access, enhancing security. Deployed across multiple Availability Zones (AZs) for high availability.
        -   `CIDR block (1)`: `10.0.1.0/24`
        -   `CIDR block (2)`: `10.0.2.0/24`
        -   Typically hosts the RDS PostgreSQL database instance.
-   **Internet Gateway (`igw-xxxxxxxx`)**: Allows resources in public subnets to communicate with the internet. Attached to the VPC.
-   **NAT Gateway (Optional but Recommended)**: Placed in a public subnet, allows resources in private subnets to initiate outbound connections to the internet (e.g., for fetching updates) without allowing inbound connections.
-   **Route Tables**: Control the flow of traffic within the VPC.
    -   **Public Route Table (`pm_public-route-table-1`)**: Associated with public subnets.
        -   Route `0.0.0.0/0` -> `Internet Gateway`: Directs internet-bound traffic to the IGW.
    -   **Private Route Tables (`pm_private-route-table-1`, `pm_private-route-table-2`)**: Associated with private subnets.
        -   Route `0.0.0.0/0` -> `NAT Gateway` (if used): Directs internet-bound traffic from private subnets through the NAT Gateway.
        -   Includes routes for local VPC traffic.
-   **Security Groups**: Act as virtual firewalls controlling inbound and outbound traffic for resources like EC2 instances and RDS databases.
    -   `pm_ec2-sg`: Allows inbound traffic on necessary ports (e.g., 80/443 for HTTP/S, 22 for SSH) from specific sources (like your IP or anywhere, depending on needs). Allows outbound traffic as needed.
    -   `pm_rds-sg`: Allows inbound traffic on the database port (e.g., 5432 for PostgreSQL) only from trusted sources, typically the EC2 instance's security group (`pm_ec2-sg`). Restricts outbound traffic.
-   **Network ACLs (NACLs)**: Optional stateless firewall layer for subnets, providing an additional layer of security (can be used for blacklisting specific IPs).

### Configuration Notes:

-   **Making RDS Public (Generally Not Recommended for Production)**:
    -   Modify `pm_rds-sg` inbound rules to allow PostgreSQL traffic (`TCP 5432`) from `0.0.0.0/0`.
    -   Ensure the RDS instance is placed in a public subnet (or associate the private subnet it's in with the public route table).
    -   Enable "DNS hostnames" in VPC settings.
-   **API Gateway**: Can be used as a managed entry point for the backend API.
    -   Set up a REST API or HTTP API.
    -   Configure integration with the EC2 instance (e.g., HTTP proxy integration using the EC2's public DNS or IP).
    -   Path: `/`, Resource: `{proxy+}` for catch-all routing. Enable CORS.
-   **EC2 Server Configuration (`.env`)**:
    ```
    PORT=80 # Or the port your application listens on
    DATABASE_URL="postgresql://<user>:<password>@<rds_endpoint>:<port>/<database_name>?schema=public"
    ```

[🔝 Back to top](#timely)

---

## 🤖 DeepSeek Chatbot Integration (Planned Feature)

The backend is designed with future chatbot integration in mind.

-   **Goal**: To allow users to create calendar events using natural language input.
    -   Example: User inputs `"I have work from 9am-5pm and then dinner from 8pm-9pm"`.
    -   An integrated chatbot (like DeepSeek or Amazon Lex) would parse this text, extract event details (title, start time, end time), and interact with the backend API to create these events in the user's calendar.
-   **Current Status**: Placeholder endpoints or hooks might exist in the backend codebase to facilitate this integration when the feature is developed.

[🔝 Back to top](#timely)

---
