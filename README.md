# Inkspire – Learning Plan Management & Skill Sharing Platform

Inkspire is a full-stack learning plan management and skill sharing platform designed to help users organize their learning journey, manage reminders and milestones, connect with other users, and share knowledge through a collaborative digital environment.

The platform combines structured personal learning management with social interaction features, allowing users to create learning plans, track progress, follow other users, and engage in a skill-sharing ecosystem.

---

## Platform Overview

Inkspire is built to support two major purposes:

- **Learning Plan Management** – Users can create, manage, and track structured learning plans with milestones and reminders.
- **Skill Sharing & Social Interaction** – Users can connect with others, follow profiles, and participate in a learning-focused community.

The system follows a full-stack client-server architecture with a React frontend and a Spring Boot backend connected through REST APIs.

---

## Technology Stack

### Frontend
- React
- JavaScript
- Context API
- CSS
- REST API integration

### Backend
- Spring Boot
- Java
- Spring Security
- JWT Authentication
- OAuth2 Authentication
- RESTful APIs

### Database & Storage
- Relational database support through Spring Data JPA
- Local file upload support

---

## System Architecture

```text
React Frontend
      |
      | REST API
      v
Spring Boot Backend
      |
      v
Database
```

The backend handles authentication, user management, learning plan logic, reminders, follow relationships, and platform-level security.

---

## Core Features

### User Authentication
Inkspire provides secure authentication and authorization features, including:

- User signup and login
- JWT-based authentication
- OAuth2 login support
- Protected routes for authenticated users
- Forgot password flow

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

Each learning plan can be broken into smaller milestones to support better tracking and progress visibility.

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
- Stay consistent with their study or skill development goals

---

## User Profiles

Each user has a profile area within the platform.

Profile-related features include:

- User identity and account management
- Viewing personal information
- Accessing personal learning activity
- Managing one’s presence within the community

---

## Social & Community Features

Inkspire is not only a personal planner but also a social learning platform.

Users can:

- Follow other users
- View followed plans
- Explore other users in the system
- Interact in a skill-sharing environment

These features make the platform more collaborative and community-driven.

---

## Skill Sharing Support

Inkspire supports a skill-sharing concept where users can benefit from a learning-focused social environment.

This can include:

- Sharing learning-related knowledge
- Following other learners
- Exploring plans and learning journeys
- Building a community around growth and collaboration

---

## Frontend Structure

The frontend is organized into reusable components and supporting modules.

Main frontend areas include:

- **Authentication components**
  - Login
  - Signup
  - Forgot Password

- **Core components**
  - Dashboard
  - Create Plan
  - Learning Plans
  - Followed Plans
  - Profile
  - Reminders
  - User List
  - Header / Footer
  - Private Route handling

- **Context management**
  - Authentication context
  - Follow context
  - Notification context

- **Services and utilities**
  - API handling
  - Authentication service
  - Validations

---

## Backend Structure

The backend is organized into modular packages.

Main backend areas include:

- **Configuration**
  - Security configuration
  - JWT authentication filter
  - JWT token provider
  - OAuth2 configuration
  - Web configuration
  - LocalDateTime deserialization support

- **Controllers**
  - Authentication controller
  - Login controller
  - User controller
  - Learning plan controller
  - Root controller
  - Global error controller

- **Models**
  - User
  - LearningPlan
  - Milestone
  - Reminder
  - UserFollow

- **Repositories**
  - User repository
  - Learning plan repository
  - Reminder repository
  - User follow repository

- **Services**
  - User service
  - Learning plan service
  - Service implementations

---

## File Upload Support

The backend contains an `uploads` directory for local file storage.

Uploaded files are stored locally during development.

For production deployment, cloud storage solutions such as Amazon S3 or Cloudinary are recommended.

---

## Project Structure

```text
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
│   ├── src/main/resources
│   │   └── application.properties
│   ├── uploads
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
│   ├── package.json
│   └── package-lock.json
│
└── README.md
```

---

## Backend Setup

### Requirements
- Java 17 or compatible Java version
- Maven

### Run the backend

```bash
cd inkspire-backend
./mvnw spring-boot:run
```

If Maven Wrapper does not work, use:

```bash
mvn spring-boot:run
```

---

## Frontend Setup

### Requirements
- Node.js
- npm

### Run the frontend

```bash
cd inkspire-frontend
npm install
npm start
```

---

## Authentication & Security

Inkspire uses modern authentication and security mechanisms, including:

- JWT-based authentication
- Spring Security
- OAuth2 login support
- Protected frontend routes
- Backend authorization handling

These help secure user accounts and sensitive actions within the system.

---

## Future Improvements

Potential future enhancements include:

- Real-time notifications
- Advanced skill-sharing posts
- Learning analytics dashboard
- Plan collaboration between users
- Cloud-based media storage
- Email-based reminder delivery
- Mobile-responsive enhancement
- Production deployment with Docker and cloud hosting

---

## Project Status

Inkspire is a full-stack learning plan management and skill sharing platform prototype that demonstrates authentication, structured planning, reminder management, user following features, and a social learning environment.

The platform can be extended into a more advanced community-driven learning ecosystem with richer collaboration and production-ready deployment features.

---

## Author

**Chanuth Jayasekera**