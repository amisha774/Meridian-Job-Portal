# Meridian — Job Portal Management System (MERN Stack)

Full-stack Job Portal Management System built with MongoDB, Mongoose, Express.js, React (Vite + TypeScript), Redux Toolkit, Tailwind CSS, and Socket.IO.

## Folder Structure

- `src/` — React + Vite frontend
  - `components/` — Reusable UI components (`Navbar`, `Footer`, `JobCard`, `CompanyCard`, `ApplyModal`, `ProtectedRoute`, `ThemeToggle`, `StatCard`)
  - `pages/` — Public pages (`public/`), Candidate pages (`seeker/`), Recruiter pages (`recruiter/`), Admin pages (`admin/`), Shared pages (`shared/`)
  - `layouts/` — `PublicLayout` and `DashboardLayout`
  - `redux/` — `store`, `authSlice`, `notificationSlice`, `themeSlice`
  - `context/` — `SocketContext` for real-time notifications
  - `services/` — Axios API client (`api.ts`)
  - `hooks/` & `utils/` — `useAuth` and formatters
- `backend/src/` — Node.js + Express + Mongoose backend
  - `config/` — `env.ts`, `db.ts`, `cloudinary.ts`, `socket.ts`
  - `models/` — `User`, `Company`, `Job`, `Application`, `SavedJob`, `Notification`, `Newsletter`, `ContactMessage`
  - `controllers/` & `routes/` — Auth, Jobs, Applications, Companies, Saved Jobs, Notifications, Admin, Public
  - `middleware/` — JWT `auth.ts`, Multer `upload.ts`, `validate.ts`, `errorHandler.ts`
  - `services/` — `uploadService.ts`, `resumeAnalyzer.ts`, `notificationService.ts`, `emailService.ts`
  - `utils/` — `seedData.ts`
- `server.ts` — Full-stack entry point serving Express API, Socket.IO, and Vite/dist on port 3000.

## Running Locally

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server (Express + MongoDB + Socket.IO + Vite):
   ```bash
   npm run dev
   ```
   If `MONGODB_URI` is not configured, the backend automatically boots an embedded MongoDB instance and seeds demo accounts:
   - **Job Seeker**: `seeker@meridian.io` / `Password123!`
   - **Recruiter**: `recruiter@meridian.io` / `Password123!`
   - **Admin**: `admin@meridian.io` / `Password123!`

## Production Build & Deployment

1. Build the frontend bundle:
   ```bash
   npm run build
   ```
2. Set `NODE_ENV=production`, `MONGODB_URI`, and `JWT_SECRET` in your hosting environment.
3. Start the production server:
   ```bash
   npm start
   ```
