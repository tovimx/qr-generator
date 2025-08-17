# Dynamic QR Code Application

This is a Next.js application for creating customized and dynamic QR codes with Linktree-style pages. Built with Next.js 15, Prisma, PostgreSQL, and Supabase.

## ✨ Features

## Architecture Notes

**Multi-Domain System**: This is a multi-tenant SaaS where each client can have custom domains. Domains are managed through the web interface, not configuration files.

- ✅ Add domains via Dashboard → Domain Manager

### ✅ **Implemented**

- **🎯 Multi-QR Dashboard** - Create up to 10 QR codes per user with tab-based interface
- **🎨 Advanced Customization** - Colors, rounded corners, logos, and real-time preview
- **🔗 Dynamic Destinations** - Switch between Linktree-style pages or direct URL redirects
- **🌐 Multi-Domain Support** - Use custom domains for QR code URLs
- **📊 Analytics Tracking** - Scan count tracking with soft delete for data preservation
- **🔐 Authentication** - Secure login/signup with Supabase Auth
- **📱 Responsive Design** - Mobile-first UI with professional styling
- **⚡ Export Options** - SVG and PNG export with multiple resolutions

## Project Documentation

- **[📋 PLAN.md](./PLAN.md)** - Complete project roadmap and implementation status
- **[🧠 CLAUDE.md](./CLAUDE.md)** - Claude Code session instructions and guidelines
- **[📝 SESSIONS.md](./SESSIONS.md)** - Development session history and progress tracking

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
