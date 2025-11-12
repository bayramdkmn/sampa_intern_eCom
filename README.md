# 🛒 E-Commerce Application | Next.js, React Native & Django

This project is a modern **e-commerce application** designed to help users search, filter, and order products efficiently.  
It was developed as a **sample internship project at Sampa Otomotiv**.

The application is built to support both **web** and **mobile** platforms, developed separately but fully integrated to work seamlessly together.

---

## 🚀 Features

-  **Advanced Product Search & Filtering** — Find products easily with multiple filtering options.  
-  **Order Management** — Users can create and track orders effortlessly.  
-  **Cross-Platform Support** — Separate web and mobile implementations that share the same backend.  
-  **State Management** — Redux for web, Zustand for mobile.  
-  **Shared Styling** — TypeScript and Tailwind CSS are used across both platforms for consistent UI.  
-  **Admin Panel** — A powerful admin dashboard built with Django for managing products, users, and orders.  
-  **Integrated Architecture** — Web, mobile, and backend layers communicate via RESTful APIs.

---

## 🧠 Tech Stack

| Layer                 | Technologies                                
|-----------------------|----------|
| **Frontend (Web)**    |   Next.js, TypeScript, Redux, Tailwind CSS 
| **Frontend (Mobile)** |   React Native, TypeScript, Zustand 
| **Backend**           | Django, Django REST Framework 
| **Database**          | PostgreSQL 
| **Other Tools**       | Axios, JWT Authentication, RESTful API Integration 

---


---

## ⚙️ Installation & Setup

### 🔹 Backend (Django)

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
The backend will run at http://localhost:8000

### 🔹 Frontend (Web)
```bash
cd frontend-web
npm install
npm run dev
```
Accessible at http://localhost:3000

### 🔹 Frontend (Mobile)
```bash
cd frontend-mobile
npm install
npm start
```
Run the app using Expo or your preferred mobile emulator.

### APPLICATION SCREENSHOT
<img width="2560" height="1440" alt="Ekran Resmi 2025-11-12 19 21 53" src="https://github.com/user-attachments/assets/a6ce4408-c9d2-412a-b9e9-46035485c520" />
<img width="2560" height="1440" alt="Ekran Resmi 2025-11-12 19 22 46" src="https://github.com/user-attachments/assets/33c7c2cc-4982-478b-bdb3-e730f34ba686" />
<img width="2560" height="1440" alt="Ekran Resmi 2025-11-12 19 22 40" src="https://github.com/user-attachments/assets/a8132195-a81d-4abc-812d-a4aa8962d361" />
<img width="2560" height="1440" alt="Ekran Resmi 2025-11-12 19 22 33" src="https://github.com/user-attachments/assets/bccc6fcd-ea17-4a8f-8114-1673b7c67303" />
<img width="2560" height="1440" alt="Ekran Resmi 2025-11-12 19 22 02" src="https://github.com/user-attachments/assets/bd8905e8-589f-4d04-b362-fb4d37dacc80" />
<img width="2560" height="1440" alt="Ekran Resmi 2025-11-12 19 22 09" src="https://github.com/user-attachments/assets/f6440d78-8692-485e-9f7a-59e4d95d0fd1" />
<img width="648" height="1345" alt="Ekran Resmi 2025-11-12 19 23 28" src="https://github.com/user-attachments/assets/2dddd44f-c180-4e8b-92ad-51932f9aa2cb" />
<img width="648" height="1345" alt="Ekran Resmi 2025-11-12 19 23 28" src="https://github.com/user-attachments/assets/a0d99ea4-4fbc-46d8-8b07-aef46648289f" />
<img width="662" height="1334" alt="Ekran Resmi 2025-11-12 19 24 08" src="https://github.com/user-attachments/assets/0be54201-b48b-4d14-ab9f-684d69457505" />
<img width="662" height="1334" alt="Ekran Resmi 2025-11-12 19 24 08" src="https://github.com/user-attachments/assets/6bd28254-32cb-4d43-a80d-737215d1114e" />













