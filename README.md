# Regald Apps — Developer Blog

Blog personal pentru Regald Apps YouTube channel. Android development, live coding, building in public.

## Tech Stack
- **Frontend**: Next.js 14 (App Router)
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Deploy**: Vercel (free tier)
- **Style**: Terminal meets editorial — dark-first, JetBrains Mono, electric green accent

## Setup

### 1. Install & Run
```bash
npm install
copy .env.local.example .env.local   # Windows
# cp .env.local.example .env.local   # Mac/Linux
npm run dev
```

### 2. Supabase
1. Creează cont pe [supabase.com](https://supabase.com)
2. New Project → name: `regald-apps`, region: Frankfurt
3. SQL Editor → paste + run `supabase-schema.sql`
4. Authentication → Users → Add User (email/password pentru admin)
5. Project Settings → API → copiază URL și anon key în `.env.local`

### 3. Set Admin
```sql
UPDATE profiles SET is_admin = true 
WHERE id = (SELECT id FROM auth.users WHERE email = 'emailul-tau@gmail.com');
```

### 4. Deploy pe Vercel
1. Push pe GitHub
2. [vercel.com](https://vercel.com) → Import repo
3. Add Environment Variables (NEXT_PUBLIC_SUPABASE_URL + KEY)
4. Deploy

## Pagini
| Pagina | URL |
|--------|-----|
| Acasă | `/` |
| Blog | `/blog` |
| Streamuri | `/streamuri` |
| Roadmap | `/roadmap` |
| Post | `/post/[slug]` |
| Admin | `/admin` |
| Admin Categories | `/admin/categories` |
| Admin Tags | `/admin/tags` |
| Admin Users | `/admin/users` |
| Admin Roadmap | `/admin/roadmap` |

## Features
- 🌙 Dark/Light theme toggle
- 💬 Comments (cu autentificare)
- ⭐ Rating system (1-5 stele)
- 🚫 User blocking (admin)
- 📊 Roadmap cu progress bars
- 🏷️ Tag management
- 📁 Category management
- ▶️ YouTube embed automat
- 📝 Markdown editor
- 🔐 Row Level Security
