
# 🛠️ FixIt - Home Service Marketplace

**FixIt** is a full-stack web application built with **Spring Boot** and **JavaScript** that serves as a three-sided marketplace. It connects **Customers** seeking home services with **verified Service Providers**, while **Admins** manage users, providers, and platform operations through a dedicated dashboard.

---



## 💡Introduction

FixIt simplifies the process of finding and managing home services. Customers can book trusted providers, Service Providers can manage their profiles and services, and Admins can oversee platform operations through a secure dashboard.

The application offers a seamless experience across roles, featuring real-time booking management, provider verification, reviews, and analytics.

---

## ✨ Features

### 👤 Customer Features
- **Authentication** – Register or log in to access personalized dashboards.  
- **Search & Discovery** – Browse and filter services by category, location, price range, and rating.  
- **Booking System** – Book services for specific dates and times.  
- **Booking Management** – Track bookings by status: `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`.  
- **Reviews** – Leave star ratings and feedback for completed services.  
- **Favorites** – Add or remove favorite service providers.  
- **Profile Management** – Update name, address, and contact details.

---

### 🛠️ Service Provider Features
- **Authentication** – Register as a provider (pending Admin approval).  
- **Profile Management** – Customize public profiles with bio, skills, and categories.  
- **Service Management** – Add, edit, or remove offered services.  
- **Booking Dashboard** – View assigned bookings with status filters.  
- **Booking Actions** – Accept (`PENDING` → `CONFIRMED`) or complete (`CONFIRMED` → `COMPLETED`) bookings.  

---

### 💼 Admin Features
- **Secure Login** – Separate Admin portal at `/api/admin/login`.  
- **Statistical Dashboard** – View metrics such as total users, active providers, and bookings.  
- **Provider Management** – Approve, verify, or suspend providers.  
- **User Management** – View and delete customer accounts.  
- **Review Moderation** – Manage reviews with statuses (`PENDING`, `APPROVED`, `REJECTED`).

---

## 🧰 Tech Stack

### **Backend**
- Java 25 / Spring Boot 3  
- Spring Security (JWT Authentication)  
- Spring Data JPA (Hibernate)  
- MySQL Database  
- Spring Mail (Email Notifications)  
- Lombok  
- Maven  

### **Frontend**
- HTML5, CSS3 (Flexbox, Grid)  
- Vanilla JavaScript (ES6+)  
- Async/Await with Fetch API  
- Multi-language support (English & Sinhala)

### **Database**
- MySQL (Compatible with MariaDB)

---

## 🗂️ Project Structure

FixIt/
├── src/
│ ├── main/
│ │ ├── java/com/fixit/
│ │ │ ├── controller/ # REST Controllers
│ │ │ ├── service/ # Business Logic
│ │ │ ├── repository/ # Data Access (Spring Data JPA)
│ │ │ ├── entity/ # Database Entities
│ │ │ ├── dto/ # Data Transfer Objects
│ │ │ ├── security/ # JWT + Security Config
│ │ │ └── exception/ # Global Exception Handling
│ │ └── resources/static/
│ │ ├── index.html
│ │ ├── login2.html
│ │ ├── admin-dashboard.html
│ │ ├── provider-dashboard.html
│ │ ├── user-dashboard.html
│ │ ├── css/
│ │ ├── js/
│ │ ├── api-config.js
│ │ └── *-translations.js
├── FixItApplication.java
├── pom.xml
└── fixit_db.sql

---

## 🚀 Setup and Installation

### 1️⃣ Prerequisites
Ensure you have the following installed:
- **Java JDK 21+**
- **Apache Maven**
- **MySQL Server / MariaDB**

---

### 2️⃣ Database Setup

```sql
CREATE DATABASE fixitdb;
USE fixitdb;
SOURCE /path/to/your/project/fixit_db.sql;
Update credentials in src/main/resources/application.properties:
```
application.properties

<img width="1220" height="696" alt="image" src="https://github.com/user-attachments/assets/1c0e5f37-4114-4202-8f01-233ae462859f" />


server.port=8080

spring.datasource.url=jdbc:mysql://localhost:3306/fixit_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=

---

### 3️⃣ Backend Setup

- Navigate to project root
```
mvn clean install
```
- Run the application.In your IDE or terminal,
```
mvn spring-boot:run
```
Server will start at:
👉 http://localhost:8080

### 4️⃣ Frontend Access
Page	URL
- Public Homepage	http://localhost:8080/index.html
 -Login / Register	http://localhost:8080/login2.html
- User Dashboard	http://localhost:8080/user-dashboard.html
- Provider Dashboard	http://localhost:8080/provider-dashboard.html
- Admin Dashboard	http://localhost:8080/admin-dashboard.html

### 5️⃣ Testing the Application
- Register new Customer and Provider accounts.

- For Admin access, manually change a user’s role:

sql
```
UPDATE users SET role = 'ADMIN' WHERE email = 'user@example.com';
```
- Then log in as Admin and access /admin-dashboard.html.

---
📘 API Documentation
All API endpoints, request/response bodies, and authorization details are included in:

📄 FixIt_API_Collection.postman_collection.json
https://kgyudayanga-1355255.postman.co/workspace/Fix-it-minal~0b831f4c-26ef-4d32bedc-d75ad74af264/collection/47524610-285f3463-ee4c-45a2-80a7-56e750ffa752?action=share&creator=47524610


You can import this file directly into Postman for testing.
---
💎 Features Overview

+ Customer -	Book services, track bookings, manage reviews, update profile.
+ Provider -	Manage services, handle bookings, view performance stats.
+ Admin -	Manage providers, users, and oversee platform analytics.

👥 Contributors
Project Lead / Developer: yasindu, minal, randini, ashinshana

+ Technologies Used: Java, Spring Boot, MySQL, HTML, CSS, JavaScript

If you’d like to contribute, feel free to fork this repository and submit a pull request!

📄 License
This project is licensed under the MIT License — feel free to use, modify, and distribute with attribution.

## 🚧 FixIt — Simplifying home services, one booking at a time.
