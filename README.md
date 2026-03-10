# Inkspire – Learning Plan Management & Skill Sharing Platform

Inkspire is a full-stack learning plan management and skill sharing platform designed to help users organize their learning journey, manage reminders and milestones, connect with other users, and share knowledge through a collaborative digital environment.

The platform combines structured personal learning management with social interaction features, allowing users to create learning plans, track progress, follow other users, and engage in a skill-sharing ecosystem.

---

# Platform Overview

Inkspire is built to support two major purposes:

### Learning Plan Management
Users can create, manage, and track structured learning plans with milestones and reminders.

### Skill Sharing & Social Interaction
Users can connect with others, follow profiles, and participate in a learning-focused community.

The system follows a full-stack client-server architecture with a **React frontend** and a **Spring Boot backend** connected through **REST APIs**.

---

# Technology Stack

## Frontend
- React
- JavaScript
- Context API
- CSS
- REST API integration

## Backend
- Spring Boot
- Java
- Spring Security
- JWT Authentication
- OAuth2 Authentication
- RESTful APIs

## Database & Storage
- MySQL
- Spring Data JPA
- Local file upload support

---

# System Architecture

```
React Frontend
      |
      | REST API
      v
Spring Boot Backend
      |
      v
MySQL Database
```

The backend manages authentication, user management, learning plan logic, reminders, follow relationships, and overall platform security.

---

# Core Features

## User Authentication
Inkspire provides secure authentication and authorization features including:

- User signup and login
- JWT-based authentication
- OAuth2 login support (Google)
- Protected routes for authenticated users
- Forgot password functionality

---

## Learning Plan Management

The platform supports structured learning management through dedicated planning features.

Users can:

- Create learning plans
- View and manage existing plans
- Track progress through milestones
- Organize learning activities in a structured way
- Maintain personalized learning paths

---

## Milestones & Progress Tracking

Each learning plan can be divided into smaller milestones to support better tracking and progress visibility.

This helps users:

- Divide goals into manageable stages
- Track completion progress
- Monitor learning consistency

---

## Reminder Management

Inkspire includes reminder functionality to support learning continuity.

Users can:

- Create reminders for learning tasks
- View upcoming reminders
- Stay consistent with study or skill development goals

---

## User Profiles

Each user has a profile within the platform.

Profile-related features include:

- User identity and account management
- Viewing personal information
- Accessing personal learning activity
- Managing presence within the community

---

## Social & Community Features

Inkspire is not only a personal planner but also a social learning platform.

Users can:

- Follow other users
- View followed learning plans
- Explore other users in the system
- Interact in a skill-sharing environment

These features help build a collaborative learning community.

---

## Skill Sharing Support

Inkspire supports a skill-sharing concept where users benefit from a learning-focused social ecosystem.

Examples include:

- Sharing learning experiences
- Following other learners
- Exploring learning journeys
- Building a community around growth and collaboration

---

# Frontend Structure

The frontend is organized into reusable components and supporting modules.

### Authentication Components
- Login
- Signup
- Forgot Password

### Core Components
- Dashboard
- Create Plan
- Learning Plans
- Followed Plans
- Profile
- Reminders
- User List
- Header / Footer
- Private Route Handling

### Context Management
- Authentication Context
- Follow Context
- Notification Context

### Services & Utilities
- API handling
- Authentication service
- Form validations

---

# Backend Structure

The backend is organized into modular packages.

### Configuration
- Security configuration
- JWT authentication filter
- JWT token provider
- OAuth2 configuration
- Web configuration
- LocalDateTime deserialization support

### Controllers
- Authentication controller
- Login controller
- User controller
- Learning plan controller
- Root controller
- Global error controller

### Models
- User
- LearningPlan
- Milestone
- Reminder
- UserFollow

### Repositories
- User repository
- Learning plan repository
- Reminder repository
- User follow repository

### Services
- User service
- Learning plan service
- Service implementations

---

# File Upload Support

The backend contains an **uploads** directory for storing uploaded files during development.

Uploaded files are stored locally when running the application locally.

For production deployment, cloud storage services such as:

- Amazon S3
- Cloudinary

are recommended.

---

# Project Structure

```
INKSPIRE
│
├── inkspire-backend
│   ├── src/main/java/com/inkspire/inkspire
│   │   ├── config
│   │   ├── controller
│   │   ├── exception
│   │   ├── model
│   │   ├── payload
│   │   ├── repository
│   │   ├── service
│   │   └── InkspireApplication.java
│   │
│   ├── src/main/resources
│   │   └── application.properties
│   │
│   ├── uploads
│   │   └── .gitkeep
│   │
│   ├── pom.xml
│   └── mvnw
│
├── inkspire-frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   │   └── auth
│   │   ├── context
│   │   ├── services
│   │   ├── styles
│   │   ├── utils
│   │   ├── App.js
│   │   └── index.js
│   │
│   ├── package.json
│   └── package-lock.json
│
└── README.md
```

---

# Backend Setup

## Requirements

- Java 17 or later
- Maven
- MySQL Server

## Database Setup

Create a MySQL database named:

```
inkspire
```

Example configuration in `application.properties`:

```
spring.datasource.url=jdbc:mysql://localhost:3306/inkspire
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update
```

---

## Run the Backend

```
cd inkspire-backend
./mvnw spring-boot:run
```

If Maven Wrapper does not work:

```
mvn spring-boot:run
```

The backend runs on:

```
http://localhost:8081
```

---

# Frontend Setup

## Requirements

- Node.js
- npm

## Run the Frontend

```
cd inkspire-frontend
npm install
npm start
```

The React application runs on:

```
http://localhost:3000
```

---

# Authentication & Security

Inkspire uses modern authentication and security mechanisms including:

- JWT-based authentication
- Spring Security
- OAuth2 login (Google)
- Protected frontend routes
- Backend authorization controls

These mechanisms help protect user accounts and secure sensitive operations.

---

# Future Improvements

Potential future enhancements include:

- Real-time notifications
- Advanced skill-sharing posts
- Learning analytics dashboard
- Plan collaboration between users
- Cloud-based media storage
- Email-based reminder delivery
- Mobile responsive improvements
- Docker-based deployment
- Cloud hosting

---

# Project Status

Inkspire is a full-stack learning plan management and skill sharing platform prototype demonstrating:

- Authentication
- Structured learning plan management
- Reminder systems
- User follow relationships
- Social learning features

The platform can be extended into a more advanced collaborative learning ecosystem with additional community-driven features and production-ready infrastructure.

---

# Author

Chanuth Jayasekera