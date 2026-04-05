# 🌍 EcoVerse — Gamified Environmental Education Platform

> | Educate. Engage. Empower.

EcoVerse is a full-stack gamified learning platform that teaches environmental awareness through quizzes, interactive games, streaks, badges and leaderboards. Built with Spring Boot and React.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [CSV Quiz Upload Format](#csv-quiz-upload-format)
- [Gamification System](#gamification-system)
- [Screenshots](#screenshots)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## ✨ Features

### 🎮 Gamification
- **XP System** — Earn XP for every correct answer. XP accumulates across all quizzes
- **Level System** — 6 levels (Lvl 1–6) with XP thresholds: 0 / 500 / 1200 / 2500 / 4500 / 7000
- **Rank System** — S (≥90%) / A (≥75%) / B (≥50%) / C (<50%) awarded after each quiz
- **Daily Streak** — Login every day to maintain your streak. 3-day streak = 1.5x XP, 7-day = 2x XP
- **Badges** — 6 achievement badges auto-awarded on milestones (First Step, Perfectionist, Legendary, etc.)
- **Replay Protection** — XP only awarded on first attempt per quiz to prevent farming
- **Global Leaderboard** — Top 20 players ranked by total XP with animated podium

### 📚 Learning
- **Quiz Missions** — Multiple choice quizzes with 30-second timer per question
- **Difficulty Tiers** — Beginner / Intermediate / Expert quiz categories
- **Hint System** — Optional hints available at 50% XP cost per question
- **Wrong Answer Explanations** — Educational explanation shown after every answer
- **CSV Bulk Upload** — Admin can upload hundreds of questions via CSV in seconds
- **10 Pre-loaded Topic Areas** — Climate Change, Biodiversity, Oceans, Forests, Renewable Energy, Water, Waste, Pollution, Sustainable Living, Punjab Environment

### 🎯 Mini Games
- **Waste Sorting Game** — Drag 12 waste items into the correct bin (Recyclable / Organic / Hazardous / Landfill)
- **Pipeline Puzzle** — Rotate pipes to connect water source to all homes. 3 difficulty levels

### 🔐 Authentication
- **JWT Authentication** — Stateless, secure, stored in memory (not localStorage)
- **Google OAuth 2.0** — One-click sign in with Google — handles both login and registration
- **Role-based Access** — ADMIN and USER roles with protected routes

### 👨‍💼 Admin Panel
- Create and delete quizzes
- Bulk upload via CSV
- Platform analytics (total users, attempts, XP awarded)
- Full leaderboard view

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Language |
| Spring Boot | 3.x | Framework |
| Spring Security | 6.x | Authentication & Authorization |
| JWT (jjwt) | 0.12.5 | Token generation |
| MySQL | 8.x | Database |
| Lombok | Latest | Boilerplate reduction |
| Google API Client | 2.0.0 | OAuth token verification |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI Framework |
| Vite | Latest | Build tool |
| React Router DOM | 6 | Client-side routing |
| Axios | Latest | HTTP client |
| React Hot Toast | Latest | Notifications |
| @react-oauth/google | Latest | Google OAuth |
| Google Fonts | — | Orbitron, Rajdhani, Share Tech Mono |

---

## 📁 Project Structure

```
ecoverse/
├── ecoverse-backend/
│   └── src/main/java/com/ecoverse/
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── QuizController.java
│       │   ├── ResultController.java
│       │   ├── LeaderboardController.java
│       │   └── ProfileController.java
│       ├── service/
│       │   ├── AuthService.java
│       │   ├── GoogleAuthService.java
│       │   ├── QuizService.java
│       │   ├── QuizAttemptService.java
│       │   ├── CsvUploadService.java
│       │   ├── LeaderboardService.java
│       │   ├── StreakService.java
│       │   ├── BadgeService.java
│       │   └── BadgeSeeder.java
│       ├── entity/
│       │   ├── User.java
│       │   ├── Quiz.java
│       │   ├── Question.java
│       │   ├── Result.java
│       │   ├── UserStreak.java
│       │   ├── Badge.java
│       │   └── UserBadge.java
│       ├── dto/
│       │   ├── AuthDTO.java
│       │   ├── QuizDTO.java
│       │   ├── AttemptDTO.java
│       │   └── GoogleAuthRequest.java
│       ├── repository/
│       ├── security/
│       │   ├── JwtUtil.java
│       │   ├── JwtFilter.java
│       │   ├── SecurityConfig.java
│       │   └── UserDetailsServiceImpl.java
│       └── exception/
│           └── GlobalExceptionHandler.java
│
└── frontend/
    └── src/
        ├── api/
        │   └── axios.js
        ├── context/
        │   ├── AuthContext.jsx
        │   └── ProtectedRoute.jsx
        ├── components/
        │   ├── HUD/
        │   ├── QuizCard/
        │   ├── OptionButton/
        │   ├── XpPopup/
        │   ├── StreakBanner/
        │   └── BadgeGrid/
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx
        │   ├── QuizPlay.jsx
        │   ├── Result.jsx
        │   ├── Profile.jsx
        │   ├── Leaderboard.jsx
        │   ├── WasteGame.jsx
        │   ├── WaterGame.jsx
        │   └── admin/
        │       ├── AdminPanel.jsx
        │       └── Analytics.jsx
        ├── styles/
        │   └── theme.css
        ├── App.jsx
        └── main.jsx
```

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8+
- Maven

### 1. Clone the Repository

```bash
git clone https://github.com/Kamal1506/ecoverse.git
cd ecoverse
```

### 2. Set Up the Database

```sql
CREATE DATABASE ecoverse_db;
```

Run the migration script:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(10) NOT NULL DEFAULT 'LOCAL';
ALTER TABLE users ADD COLUMN IF NOT EXISTS picture_url VARCHAR(300);
ALTER TABLE users MODIFY COLUMN password VARCHAR(255);
ALTER TABLE quiz ADD COLUMN IF NOT EXISTS difficulty VARCHAR(15) NOT NULL DEFAULT 'BEGINNER';
ALTER TABLE question ADD COLUMN IF NOT EXISTS hint VARCHAR(300);
ALTER TABLE question ADD COLUMN IF NOT EXISTS explanation VARCHAR(500);
```

### 3. Configure Backend

Edit `ecoverse-backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ecoverse_db
spring.datasource.username=root
spring.datasource.password=${DB_PASSWORD:your_password}
spring.jpa.hibernate.ddl-auto=update

server.port=8080

jwt.secret=your_jwt_secret_key_minimum_32_characters
jwt.expiration=86400000

google.client-id=your_google_client_id.apps.googleusercontent.com
```

### 4. Run the Backend

```bash
cd ecoverse-backend
./mvnw spring-boot:run
```

Backend starts at `http://localhost:8080`

### 5. Configure Frontend

Create `frontend/.env`:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### 6. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at `http://localhost:5173`

### 7. Create Admin Account

Register normally, then run this SQL to promote to admin:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

---

## 🔑 Environment Variables

### Backend (`application.properties`)

| Variable | Description | Example |
|---|---|---|
| `spring.datasource.url` | MySQL connection URL | `jdbc:mysql://localhost:3306/ecoverse_db` |
| `spring.datasource.username` | DB username | `root` |
| `DB_PASSWORD` | DB password (env var) | `your_password` |
| `jwt.secret` | JWT signing secret (32+ chars) | `ecoverse_super_secret_key_2024` |
| `jwt.expiration` | Token expiry in milliseconds | `86400000` (24 hours) |
| `google.client-id` | Google OAuth Client ID | `xxxxx.apps.googleusercontent.com` |

### Frontend (`.env`)

| Variable | Description |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID (same as backend) |

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register with email/password |
| POST | `/api/auth/login` | Public | Login with email/password |
| POST | `/api/auth/google` | Public | Login/Register with Google |

### Quizzes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/quizzes` | Any | Get all quiz summaries |
| GET | `/api/quizzes/{id}` | Any | Get quiz detail |
| GET | `/api/quizzes/{id}/questions` | Any | Get questions (no correct answers) |
| POST | `/api/quizzes` | ADMIN | Create a quiz |
| POST | `/api/quizzes/upload` | ADMIN | Bulk upload via CSV |
| DELETE | `/api/quizzes/{id}` | ADMIN | Delete a quiz |

### Results & Profile

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/quizzes/{id}/attempt` | Any | Submit quiz answers |
| GET | `/api/results/me` | Any | Get my result history |
| GET | `/api/profile/me` | Any | Get profile with badges and streak |

### Leaderboard & Analytics

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/leaderboard` | Any | Top 20 players by XP |
| GET | `/api/admin/analytics` | ADMIN | Platform analytics |

---

## 🗄 Database Schema

```sql
users         — id, name, email, password, role, total_xp, provider, picture_url, created_at
quiz          — id, title, description, xp_reward, difficulty, created_at
question      — id, quiz_id, question_text, option_a/b/c/d, correct_option, hint, explanation
result        — id, user_id, quiz_id, score, xp_earned, percentage, rank, total_questions, attempted_at
user_streak   — id, user_id, current_streak, longest_streak, last_login_date
badge         — id, code, name, description, icon, condition_type, condition_value, rarity
user_badge    — id, user_id, badge_id, earned_at
```

---

## 📄 CSV Quiz Upload Format

Upload quizzes in bulk via the Admin Panel using this CSV format:

```
quizTitle,question,optionA,optionB,optionC,optionD,correctOption,hint,explanation
```

### Example

```csv
quizTitle,question,optionA,optionB,optionC,optionD,correctOption,hint,explanation
Climate Change,What gas causes the greenhouse effect?,Oxygen,Nitrogen,CO2,Argon,C,Think about car exhaust,Carbon dioxide traps heat in the atmosphere causing global warming
Climate Change,Which agreement targets 1.5°C warming limit?,Kyoto Protocol,Paris Agreement,Geneva Convention,Rio Summit,B,It was signed in France in 2015,The Paris Agreement was adopted in 2015 and entered into force in 2016
```

### Rules
- `correctOption` must be A, B, C or D
- `hint` and `explanation` are optional but highly recommended
- Multiple quizzes can be in one file — group rows by `quizTitle`
- Headers must be exactly as shown above

---

## 🎮 Gamification System

### XP & Levels

| Level | XP Required | Multiplier |
|---|---|---|
| 1 | 0 | 1x |
| 2 | 500 | 1x |
| 3 | 1200 | 1x |
| 4 | 2500 | 1x |
| 5 | 4500 | 1x |
| 6 | 7000 | 1x |

### Streak Multipliers

| Streak | XP Multiplier |
|---|---|
| 1–2 days | 1.0x |
| 3–6 days | 1.5x |
| 7+ days | 2.0x |

### Rank System

| Rank | Score Required |
|---|---|
| S | ≥ 90% |
| A | ≥ 75% |
| B | ≥ 50% |
| C | < 50% |

### Badges

| Badge | Condition | Rarity |
|---|---|---|
| 🌱 First Step | Complete first quiz | Common |
| 🧭 Eco Explorer | Complete 5 quizzes | Common |
| 🌟 Perfectionist | Score 100% on any quiz | Rare |
| 👑 Legendary | Achieve S rank on any quiz | Rare |
| 🔥 Streak Warrior | Maintain 3-day streak | Epic |
| ⚡ XP Master | Earn 1000 total XP | Epic |

---

## 🌐 Deployment

### Backend — Railway

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add MySQL plugin
4. Set environment variables:
   ```
   DB_PASSWORD=your_password
   SPRING_DATASOURCE_URL=jdbc:mysql://...railway URL...
   JWT_SECRET=your_secret
   GOOGLE_CLIENT_ID=your_client_id
   ```

### Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Set root directory to `frontend`
3. Add environment variable:
   ```
   VITE_GOOGLE_CLIENT_ID=your_client_id
   VITE_API_BASE_URL=https://your-railway-backend.up.railway.app
   ```
4. Update `vite.config.js` proxy target to your Railway backend URL

### Google OAuth — Production Setup

In Google Cloud Console add your production URLs:
- Authorized JavaScript origins: `https://your-vercel-app.vercel.app`
- Authorized redirect URIs: `https://your-vercel-app.vercel.app`

---

## 👥 Team

Built as part of a Government of Punjab environmental education initiative.

- **Backend** — Spring Boot REST API with JWT + Google OAuth
- **Frontend** — React + Vite with full gamification UI
- **Database** — MySQL with 7 related tables
- **Games** — Canvas-based Water Puzzle + Drag-and-drop Waste Sorter

---

## 📜 License

This project is built for educational and government use.  