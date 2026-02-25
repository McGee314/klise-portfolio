
# 📸 KLISE Web Profile

### *Photography and Cinematography Community*

A modern and responsive web profile for **KLISE – Photography and Cinematography Community**, built using the MERN stack.
This website showcases KLISE activities, gallery, and Instagram presence, and includes a fully functional Admin Portal with CRUD features.

---

## 🚀 Features

### 🌐 Public Website

* Modern cinematic dark theme UI
* Responsive design (mobile, tablet, desktop)
* Hero section with tagline
* About KLISE section
* Dynamic Activities section (fetched from database)
* Gallery section (dynamic content)
* Instagram integration
* Contact form
* Smooth navigation with React Router

### 🔐 Admin Portal

* Secure login authentication (JWT-based)
* Protected routes
* Dashboard overview
* Full CRUD functionality:

  * Activities
  * Gallery
  * Announcements (optional)
* Sidebar-based admin layout
* Logout functionality

---

## 🛠 Tech Stack

### Frontend

* React.js (Functional Components)
* React Router DOM
* Axios
* Tailwind CSS
* Context API (optional for auth state)

### Backend

* Node.js
* Express.js
* JWT Authentication
* RESTful API Architecture

### Database

* MongoDB (Mongoose ODM)

---

## 📂 Project Structure

```
klise-web-profile/
│
├── client/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── admin/
│   │   ├── services/
│   │   ├── context/
│   │   ├── App.js
│   │   └── main.jsx
│   └── package.json
│
├── server/                 # Express Backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── .env
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/klise-web-profile.git
cd klise-web-profile
```

---

### 2️⃣ Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run backend:

```bash
npm run dev
```

Server runs on:

```
http://localhost:5000
```

---

### 3️⃣ Frontend Setup

Open new terminal:

```bash
cd client
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 🔐 Admin Access

Admin Login Route:

```
/admin/login
```

After login:

```
/admin/dashboard
```

Admin can:

* Create activities
* Edit activities
* Delete activities
* Manage gallery
* Manage announcements

---

## 📡 API Endpoints (Sample)

### Auth

```
POST   /api/auth/login
```

### Activities

```
GET    /api/activities
POST   /api/activities
PUT    /api/activities/:id
DELETE /api/activities/:id
```

### Gallery

```
GET    /api/gallery
POST   /api/gallery
PUT    /api/gallery/:id
DELETE /api/gallery/:id
```

---

## 🎨 Design Philosophy

The design follows a **cinematic dark theme** to represent:

* Professional photography
* Film aesthetics
* Creative community spirit

Focus:

* Clean typography
* Smooth animations
* Visual storytelling
* Minimal but powerful layout

---

## 📱 Responsive Design

Fully optimized for:

* Desktop
* Tablet
* Mobile devices

---

## 🛡 Security Features

* JWT authentication
* Password hashing (bcrypt)
* Protected admin routes
* Environment variables for sensitive data

---

## 🌍 Future Improvements

* Role-based authentication (Super Admin / Editor)
* Cloudinary image upload integration
* Instagram API auto-feed
* Deployment with Vercel & Render
* Analytics dashboard
* Email integration for contact form

---

## 👥 About KLISE

**KLISE** is a Photography and Cinematography Community dedicated to:

* Visual storytelling
* Creative collaboration
* Skill development
* Media production excellence

---

## 📄 License

This project is developed for educational and organizational purposes.

---

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`
