# Deploy FormCraft (Frontend + Backend)

Your app has **two parts**. Both must be live for login and forms to work.

| Part | Host (free) | Example URL |
|------|-------------|-------------|
| **Frontend** (Next.js) | [Netlify](https://app.netlify.com) | `https://your-site.netlify.app` |
| **Backend** (Express API) | [Render](https://render.com) | `https://formcraft-api.onrender.com` |
| **Database** (MySQL) | Cloud MySQL (not XAMPP) | TiDB / Railway / Aiven |

XAMPP only works on your PC. Production needs **cloud MySQL**.

---

## Step 1 — Cloud MySQL database

1. Create a free MySQL database (pick one):
   - [TiDB Cloud](https://tidbcloud.com) (MySQL compatible)
   - [Railway](https://railway.app) → Add MySQL
   - [Aiven](https://aiven.io) MySQL free trial

2. Note: **host**, **port**, **user**, **password**, **database name**.

3. Run `backend/schema.sql` in the provider’s SQL console (creates tables).

---

## Step 2 — Deploy backend on Render

1. Sign in at [render.com](https://render.com) with **GitHub**.

2. **New +** → **Blueprint** (or **Web Service**).

3. Connect repo: **Chandgudepooja25/Dynamic-Form-Builder**.

4. If using **Blueprint**, Render reads `render.yaml` from the repo.

   Or create **Web Service** manually:

   | Setting | Value |
   |---------|--------|
   | **Build Command** | `npm run build:backend` |
   | **Start Command** | `npm run start:backend` |
   | **Health Check Path** | `/api/health` |

5. **Environment variables** (Render dashboard → Environment):

   | Key | Value |
   |-----|--------|
   | `DB_HOST` | From your cloud MySQL |
   | `DB_PORT` | `3306` |
   | `DB_USER` | From provider |
   | `DB_PASSWORD` | From provider |
   | `DB_NAME` | e.g. `dynamic_form_builder` |
   | `JWT_SECRET` | Long random string |
   | `JWT_EXPIRES_IN` | `7d` |
   | `ADMIN_EMAILS` | `admin@example.com` |
   | `CORS_ORIGIN` | Your Netlify URL (Step 3) |

6. Deploy. Copy your API URL, e.g.  
   `https://formcraft-api.onrender.com`

7. Test: open `https://YOUR-API.onrender.com/api/health`  
   You should see `{"status":"ok",...}`.

**Note:** Free Render sleeps after ~15 min idle; first request may be slow.

---

## Step 3 — Connect Netlify frontend to API

1. Netlify → your site → **Site configuration** → **Environment variables**.

2. Add:

   | Key | Value |
   |-----|--------|
   | `NEXT_PUBLIC_API_BASE_URL` | `https://formcraft-api.onrender.com` (your Render URL, no trailing `/`) |

3. **Build settings** (if not already):

   | Setting | Value |
   |---------|--------|
   | Build command | `npm run build` |
   | Publish directory | `frontend/.next` |

4. **Redeploy** the Netlify site.

5. Go back to **Render** → set `CORS_ORIGIN` to your exact Netlify URL, e.g.  
   `https://precious-fairy-c1cc91.netlify.app`  
   Then **Manual Deploy** on Render.

---

## Step 4 — Test login

- Netlify URL → **Login**
- `admin@example.com` / `admin123` (if DB was empty on first API start — auto seed)

---

## Architecture

```
Browser → Netlify (UI) → fetch → Render (API) → Cloud MySQL
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Login fails / network error | Check `NEXT_PUBLIC_API_BASE_URL` on Netlify |
| CORS error in browser console | Add Netlify URL to `CORS_ORIGIN` on Render |
| API 503 / slow | Free Render waking up — wait 30–60 s and retry |
| API crash on start | Check `DB_*` vars and that `schema.sql` was run |
| Netlify build `tsc not found` | Use `npm run build` (frontend only), not `build:all` |

---

## Local vs production

| | Local | Production |
|---|--------|------------|
| Database | XAMPP MySQL | Cloud MySQL |
| Frontend | `localhost:3000` | Netlify |
| Backend | `localhost:4000` | Render |
