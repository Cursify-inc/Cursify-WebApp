# Important note !!
###  this warning should be ignored in developing for now,
### [browser] THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.
### it is related to components/marketing/GeometryHero.tsx usage of "clock"
### for animating movements for now we can ignore it safely
# Important note 2 !!
### if you're facing with any issues about performance, go to 
### app/page.tsx
### and comment out GeometryHero in line 19
# Cursify Landing Page

Premium 3D-style animation-rich landing page for Cursify, an AI-powered IDE platform.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

## Run locally
```bash
npm install
npm run dev

Visit:

txt
http://localhost:3000

## Production build

bash
npm run build
npm run start

## Product Positioning

Cursify is a professional AI-powered IDE platform built around:

- Web account platform
- Secure subscription
- Account-bound desktop downloads
- Desktop app pairing
- Device registration
- License validation
- Agent/tool/extension ecosystem
- Linked developer accounts
- Desktop sync


---


under development: header/footer link to `/login`, `/signup`, `/download`, `/privacy`, and `/terms`.

app/login/page.tsx
app/signup/page.tsx
app/download/page.tsx
app/privacy/page.tsx
app/terms/page.tsx
