# ML Lab Generator Monorepo

## Overview

**ML Lab Generator** is a full-stack platform for generating, exporting, and managing interactive machine learning labs. It features:
- AI-powered lab generation (outline, content, gamified/project-based options)
- Export to PDF/DOCX
- Admin portal for creating, saving, and managing labs
- Secure access with authentication

Built with Node.js (Express) for the backend and Next.js (React) for the admin portal frontend.

---

## Monorepo Structure

```
lab_generator/
├── mcp/            # Backend: Express API, lab generation logic, Swagger docs
├── admin-portal/   # Frontend: Next.js admin portal (React, Tailwind)
```

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- (For backend) [Groq API key](https://console.groq.com/keys)

### 1. Backend (MCP)
```bash
cd mcp
cp .env.example .env   # (if provided)
npm install
# Set your GROQ_API_KEY in .env or export GROQ_API_KEY=...
npm run build
npm start
# API runs at http://localhost:3001
# Swagger docs: http://localhost:3001/api/docs
```

### 2. Frontend (Admin Portal)
```bash
cd admin-portal
cp .env.local.example .env.local   # (if provided)
npm install
# Set NEXT_PUBLIC_API_URL=http://localhost:3001 in .env.local
npm run dev
# App runs at http://localhost:3000
```

---

## Deployment

### Backend (MCP)
- **Recommended:** Deploy to [Render](https://render.com/) using the provided `Dockerfile`.
- Exposes port `3001`.
- Set `GROQ_API_KEY` in Render environment variables.

### Frontend (Admin Portal)
- **Recommended:** Deploy to [Vercel](https://vercel.com/).
- Set `NEXT_PUBLIC_API_URL` in Vercel project settings to your backend URL (e.g., `https://ml-lab-generator-server.onrender.com`).

---

## API Documentation
- **Swagger UI:** [http://localhost:3001/api/docs](http://localhost:3001/api/docs) (or your deployed backend URL)
- **Authentication:** All lab management endpoints require HTTP Basic Auth (`admin`/`admin` by default).

---

## Lab Management (Admin Portal)
- **Login:** Use the admin portal and log in with your credentials.
- **Create Labs:** Use the wizard to generate new labs (interactive, gamified, or project-based).
- **Save Labs:** Save generated labs to the backend for later use.
- **View/Edit/Delete:** Manage all saved labs from the portal.
- **Export:** Download labs as PDF or DOCX.

---

## Contributing

1. Fork this repo and clone your fork.
2. Create a new branch for your feature or fix.
3. Make your changes (see `/mcp` and `/admin-portal` for backend/frontend).
4. Submit a pull request with a clear description.

**Issues and suggestions welcome!**

---

## License
MIT (or specify your license here) 