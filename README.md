# Nutrilea - Moringa Products E-Commerce Platform

A full-stack e-commerce platform for moringa products and health supplements, built with React frontend and Flask backend.

## 🗄️ Database Migration Notice

**This project has been migrated from PostgreSQL to MongoDB!**

- **Backend**: Now uses MongoDB with MongoEngine
- **Data Storage**: All data stored in MongoDB Atlas
- **API**: Same endpoints, now powered by MongoDB
- **Models**: Converted from SQLAlchemy to MongoEngine Documents

---

## Backend Setup (Flask + MongoDB)

### Prerequisites
- Python 3.10+
- MongoDB Atlas account (for cloud database)
- Git

### Check Python version
Make sure you have Python 3.10 installed:

```bash
python --version
```

If it shows Python 3.10.x, you can proceed.

### Create a virtual environment

```bash
python -m venv venv
```

### Activate the virtual environment

**Windows:**
```bash
.\venv\Scripts\Activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Update `DATABASE_URL` with your MongoDB Atlas connection string

Example `.env`:
```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
```

### Run the backend

```bash
python run.py
```

The backend will connect to MongoDB and start on `http://localhost:5000`

---

## Deploy frontend to Vercel

1. Push your code to GitHub (if not already).
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo.
3. **Root Directory**: leave as **`.`** (repo root). The root `vercel.json` builds the `frontend` folder and deploys it.
4. **Environment variables** (optional): add `REACT_APP_API_URL` = `https://nutrilea-backend.onrender.com/api` if you want to override.
5. Click **Deploy**. The app will be live at `https://your-project.vercel.app`.

**Backend**: Ensure your backend (e.g. `https://nutrilea-backend.onrender.com`) is deployed and running so register/login and API calls work in production.
