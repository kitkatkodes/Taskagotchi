# Tamogatchi Focus (Hackathon MVP)

AI-powered Tamagotchi-style productivity app where completing tasks keeps your virtual pet happy and evolving.

## Stack
- Frontend: React + Tailwind CSS + Framer Motion + Vite
- Backend: Django + Django REST Framework + Django Channels + SQLite

## Folder Structure
```text
Hackerrank Tamogatchi/
  backend/
    manage.py
    requirements.txt
    db.sqlite3
    tamogatchi_backend/
      settings.py
      urls.py
      asgi.py
      wsgi.py
    core/
      models.py
      views.py
      serializers.py
      consumers.py
      routing.py
      urls.py
      signals.py
      migrations/
        0001_initial.py
  frontend/
    package.json
    index.html
    tailwind.config.js
    postcss.config.js
    vite.config.js
    src/
      App.jsx
      api.js
      index.css
      main.jsx
      components/
        Dashboard.jsx
        PetDisplay.jsx
        TaskList.jsx
        TaskItem.jsx
        StatsBar.jsx
        PetSelector.jsx
        AIMessageBox.jsx
```

## Features
- Simple auth (`/auth/`) with email + password login/register
- Task management (`/tasks/` add/complete/delete)
- Pet state system (`/pet/`) with mood, health, energy, evolution
- Stats system (`/stats/`) for XP + streak + completed tasks
- Real-time updates with WebSocket endpoint `ws://localhost:8000/ws/pet/<user_id>/`
- Mock AI messages + smart suggestions based on user progress

## Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python manage.py makemigrations core
python manage.py migrate
python manage.py runserver 8000
```

## Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Demo Flow
1. Register a user
2. Pick a pet type
3. Add and complete tasks
4. Watch XP/streak increase and pet mood change in real time
5. Reach 5+ completed tasks to evolve to stage 2, 10+ for stage 3

## Hackathon Notes
- Optimized for visual delight and speed of implementation
- AI is intentionally mocked to keep the MVP lightweight and reliable for demos
