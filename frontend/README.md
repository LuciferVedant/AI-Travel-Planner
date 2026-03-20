# TrippieAI - Frontend

The high-end, reactive user interface for the **TrippieAI** Travel Planner.

## 🎨 Tech Stack
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Components)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) (Slices, Typed Hooks)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (Modern CSS processing)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) (Micro-interactions & Page transitions)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Auth**: [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google) (Google One-Tap)

## 🏗️ Architecture
- **Root Layout**: Centralized providers for Redux, Theme, and Google Auth.
- **Slice-based Context**: Using Redux to handle user session, auth state, and data hydration.
- **Modular Components**: Highly reusable premium UI components with glassmorphic aesthetics.
- **Responsive Design**: Mobile-first navigation with a sophisticated collapsible drawer.

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Variables
Create a file named `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_id_here
```

### 3. Development
```bash
npm run dev
```

## 🌐 Deployment (Vercel)
1. Push your code to GitHub.
2. Connect your project to [Vercel](https://vercel.com).
3. Set the **Root Directory** to `frontend`.
4. Configure your environment variables in the Vercel dashboard.
