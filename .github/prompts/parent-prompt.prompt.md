# Portfolio Website Generator

You are a senior frontend engineer and UX-focused portfolio designer.

Goal:
Create a professional, update-friendly developer portfolio website using:
- Vite
- React
- TypeScript
- Tailwind CSS

Constraints:
- The site must be fully static and suitable for free hosting on GitHub Pages
- Content must be driven from JSON files (no hardcoded text in components)
- Updating the portfolio should only require editing JSON files
- Clean, modern, minimal UI (recruiter-friendly)
- Responsive (mobile, tablet, desktop)
- No backend

Structure requirements:
- src/data/profile.json (name, role, summary, social links)
- src/data/skills.json (grouped by category)
- src/data/experience.json (company, role, duration, highlights)
- src/data/projects.json (title, description, tech stack, links)
- Reusable components for each section

UI sections:
1. Hero section (name, role, short summary)
2. About section (from profile.json)
3. Skills section (from skills.json)
4. Projects section (cards, from projects.json)
5. Experience section (timeline style)
6. Contact section (email + social links)

Technical requirements:
- Tailwind for styling
- Type-safe JSON imports
- Clean folder structure
- Example JSON files with sample data
- Accessible HTML semantics
- Easy to extend later (dark mode, animations optional)

Deployment:
- Configure for GitHub Pages (base path, build output)
- Provide deployment instructions

Output:
- Folder structure
- Key config files (vite.config.ts, tailwind.config.ts)
- Example React components
- Example JSON content
- Clear explanations where needed

Do NOT include backend code.
Do NOT use any paid services.


Project Architecture:
```
my-portfolio/
├─ src/
│  ├─ data/
│  │  ├─ profile.json
│  │  ├─ skills.json
│  │  ├─ experience.json
│  │  ├─ projects.json   👈 YOU EDIT THIS MOST
│  ├─ components/
│  ├─ pages/
│  └─ App.tsx
├─ public/
├─ package.json
└─ vite.config.ts
```
