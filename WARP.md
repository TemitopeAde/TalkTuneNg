# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
```bash
npm run dev          # Start development server on localhost:3000
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run Next.js linting
```

### Database Commands
```bash
npx prisma generate  # Generate Prisma client (required after schema changes)
npx prisma migrate dev  # Create and apply new migration
npx prisma db push   # Push schema changes without migration
npx prisma studio    # Open Prisma Studio database GUI
```

### API Documentation
```bash
npm run generate-docs  # Generate API documentation using apidoc
```

### Testing Individual Components
When testing specific features:
- Authentication flows: Use `/auth/login`, `/auth/register`, `/auth/verify`
- Dashboard features: Access via `/dashboard` (requires authentication)
- Script management: Visit `/dashboard/scripts`

## Architecture Overview

### Multi-Domain Architecture
The application uses Next.js middleware to handle two distinct domains:
- **Marketing site**: Main domain with public pages (landing, pricing, blogs, contact)
- **App domain**: Subdomain for authenticated dashboard functionality

Routes are organized using Next.js app directory with route groups:
- `(main)`: Marketing site pages with Navbar/Footer layout
- `dashboard`: Authenticated app pages with Sidebar/Dashboard layout
- `auth`: Authentication pages with minimal layout

### Database & Authentication
- **Database**: PostgreSQL with Prisma ORM
- **Generated Client**: Custom path at `src/generated/prisma` (not default location)
- **Auth System**: Custom JWT-based authentication with server actions
- **User Flow**: Registration → Email OTP verification → Dashboard access

Core models:
- `User`: Authentication and profile data with OTP verification
- `Script`: Text-to-speech script management with project organization
- `VoiceProfile`: Voice customization settings (gender, age, mood, language)
- `Account/Session`: NextAuth compatibility (future OAuth integration)

### State Management
- **Global State**: Zustand with persistence for user authentication state
- **Server State**: TanStack Query for API calls and caching
- **Form State**: Custom hooks with Zod validation schemas

### Server Actions Architecture
Authentication and core operations use Next.js server actions instead of API routes:
- Located in `src/actions/` directory
- Handle validation, database operations, and JWT token management
- Cookie-based session management with httpOnly flags

### Component Architecture
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Layout Components**: Route-specific layouts with shared navigation
- **Feature Components**: Business logic components (UploadScript, VoiceProfile, etc.)
- **Modal System**: Centralized modal management with MainModal wrapper

### File Structure Conventions
- `src/actions/`: Server actions for backend operations
- `src/components/`: React components (UI, features, layouts)
- `src/hooks/`: Custom React hooks organized by feature
- `src/lib/`: Utilities, Prisma client, JWT helpers
- `src/store/`: Zustand stores
- `src/types/`: TypeScript type definitions
- `src/utils/`: Validation schemas, email templates, utilities

### Key Technical Details
- **Styling**: Tailwind CSS with custom design system and CSS variables
- **Validation**: Zod schemas for both client and server-side validation  
- **Email**: Nodemailer for OTP verification emails
- **Voice Integration**: ElevenLabs React SDK for text-to-speech features
- **Prisma Output**: Custom generation path requires `npx prisma generate` after schema changes

### Development Patterns
When working with this codebase:
- Authentication state is managed via Zustand store (`useUserStore`)
- Server actions return consistent response objects with `success`/`error` properties
- Form validation uses Zod schemas from `src/utils/schema.ts`
- Database queries use custom Prisma client from `src/lib/prisma.ts`
- New components should follow the existing folder structure and naming conventions

### Environment Requirements
The application expects PostgreSQL database configuration and email service setup for OTP functionality. JWT secrets and email provider credentials must be configured for full functionality.