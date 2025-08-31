# CRITICAL RULES - MUST FOLLOW

## MOST IMPORTANT RULE

**NEVER include Claude attribution in git commits. DO NOT add any of the following:**

- No "🤖 Generated with Claude Code" messages
- No "Co-Authored-By: Claude <noreply@anthropic.com>" lines
- No AI attribution of any kind in commit messages
- Keep commits clean with only the technical description of changes

# QR Code Generator E2E Testing Branch

## Project Overview

This is a **Dynamic QR Code Application** built with Next.js 15 that allows users to create multiple customized QR codes with Linktree-style pages. The system includes multi-domain support, detailed analytics, and a tabs-based dashboard interface.

### Key Technologies

- **Framework**: Next.js 15.4.5 (App Router, Server Components)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth with SSR
- **Styling**: Tailwind CSS v4
- **Hosting**: Vercel

## Essential Features

1. **Multi-QR Dashboard**: Users can create up to 10 QR codes with tabs interface
2. **Dynamic QR Pages**: Each QR code generates a Linktree-style landing page
3. **Design Customization**: Theme system with colors, avatars, and layouts
4. **Multi-Domain Support**: Clients can use custom domains for their QR pages
5. **Analytics**: Track scans, visitors, and link clicks
6. **Projects**: Organize QR codes into projects for better management
