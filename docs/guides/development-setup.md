# Development Setup Guide

**Kiki Packaging Backoffice**  
**Last Updated:** November 23, 2025

---

## Prerequisites

Before starting development, ensure you have:

- **Node.js:** v18.0.0 or higher (LTS recommended)
- **Yarn:** v1.22.22 (project uses Yarn)
- **Git:** For version control
- **Code Editor:** VS Code recommended
- **Database Account:** Supabase or Azure Cosmos DB (TBD)

---

## Initial Setup

### 1. Clone Repository

```powershell
git clone <repository-url>
cd kiki-packaging
```

### 2. Install Dependencies

```powershell
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# App Configuration
NUXT_PUBLIC_APP_NAME=Kiki Packaging Backoffice
NUXT_PUBLIC_APP_URL=http://localhost:3000

# Database Configuration (TBD - Choose Supabase or Cosmos DB)
# Option A: Supabase
# SUPABASE_URL=your-supabase-url
# SUPABASE_KEY=your-supabase-anon-key

# Option B: Azure Cosmos DB
# COSMOS_ENDPOINT=your-cosmos-endpoint
# COSMOS_KEY=your-cosmos-key
# COSMOS_DATABASE_NAME=kiki-packaging

# Authentication (TBD - Based on database choice)
# AUTH_SECRET=generate-a-random-secret
# AUTH_ORIGIN=http://localhost:3000

# Image Storage (Optional)
# STORAGE_URL=your-storage-url
# STORAGE_KEY=your-storage-key
```

**⚠️ Important:** Never commit `.env` to version control. It's already in `.gitignore`.

---

## Database Setup

### Option A: Supabase (Recommended for Development)

1. **Create Supabase Project:**

   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and anon key

2. **Install Supabase Module:**

   ```powershell
   yarn add @nuxtjs/supabase
   ```

3. **Configure in `nuxt.config.ts`:**

   ```typescript
   export default defineNuxtConfig({
     modules: ["@nuxtjs/supabase"],
     supabase: {
       url: process.env.SUPABASE_URL,
       key: process.env.SUPABASE_KEY,
       redirect: false,
     },
   });
   ```

4. **Create Database Tables:**
   - Run SQL migrations in Supabase SQL Editor
   - See `/docs/database/supabase-schema.sql` (to be created)

### Option B: Azure Cosmos DB

1. **Create Cosmos DB Account:**

   - Go to Azure Portal
   - Create Cosmos DB account (SQL API)
   - Create database: `kiki-packaging`
   - Create containers (see schema below)

2. **Install Azure SDK:**

   ```powershell
   yarn add @azure/cosmos
   ```

3. **Create Database Schema:**
   - See `/docs/database/cosmos-schema.md` (to be created)

---

## Authentication Setup

### With Supabase Auth

Supabase includes built-in authentication. Configuration is handled in the Supabase module setup above.

### With @sidebase/nuxt-auth (Alternative)

1. **Install:**

   ```powershell
   yarn add @sidebase/nuxt-auth
   ```

2. **Configure in `nuxt.config.ts`:**
   ```typescript
   export default defineNuxtConfig({
     modules: ["@sidebase/nuxt-auth"],
     auth: {
       baseURL: process.env.AUTH_ORIGIN,
       provider: {
         type: "local",
       },
     },
   });
   ```

---

## Additional Modules Setup

### Internationalization (i18n)

1. **Install:**

   ```powershell
   yarn add @nuxtjs/i18n
   ```

2. **Configure in `nuxt.config.ts`:**

   ```typescript
   export default defineNuxtConfig({
     modules: ["@nuxtjs/i18n"],
     i18n: {
       locales: [
         { code: "en", file: "en.json" },
         { code: "th", file: "th.json" },
       ],
       defaultLocale: "en",
       langDir: "locales/",
       strategy: "no_prefix",
     },
   });
   ```

3. **Create locale files:**
   - `/app/locales/en.json`
   - `/app/locales/th.json`

### State Management (Pinia)

1. **Install:**

   ```powershell
   yarn add @pinia/nuxt
   ```

2. **Configure in `nuxt.config.ts`:**
   ```typescript
   export default defineNuxtConfig({
     modules: ["@pinia/nuxt"],
   });
   ```

### Date Handling

1. **Install dayjs:**
   ```powershell
   yarn add dayjs
   ```

### Form Validation

1. **Install vee-validate and zod:**
   ```powershell
   yarn add vee-validate zod @vee-validate/zod
   ```

---

## Project Structure Setup

Create the following folder structure:

```
app/
├── pages/              # Create for routing
├── layouts/            # Create for layouts
├── components/         # Create for components
├── composables/        # Create for composables
├── middleware/         # Create for route middleware
├── stores/             # Create for Pinia stores
├── utils/              # Create for utility functions
├── types/              # Create for TypeScript types
└── locales/            # Create for i18n translations
    ├── en.json
    └── th.json

server/
└── api/                # Create for API routes
```

---

## Running the Development Server

### Start Development Server

```powershell
yarn dev
```

The application will be available at: `http://localhost:3000`

### Common Commands

```powershell
# Development
yarn dev                 # Start dev server
yarn build               # Build for production
yarn generate            # Generate static site
yarn preview             # Preview production build

# Code Quality
yarn lint                # Run ESLint
yarn lint:fix            # Fix ESLint errors
yarn typecheck           # Run TypeScript check

# Database (when migrations are set up)
yarn db:migrate          # Run database migrations
yarn db:seed             # Seed initial data
```

---

## Development Workflow

### Before Starting Any Feature

1. **Check Implementation Status:**

   ```powershell
   # Read the status file
   cat docs/progress/implementation-status.md
   ```

2. **Verify Prerequisites:**

   - Ensure required modules are installed
   - Verify database is set up
   - Check auth is configured

3. **Create Feature Branch:**
   ```powershell
   git checkout -b feature/feature-name
   ```

### During Development

1. **Follow Project Instructions:**

   - Read `.kiki-packaging.instructions.md`
   - Follow composable best practices
   - Use Nuxt UI components
   - Add proper error handling

2. **Test Your Changes:**

   - Manual testing in browser
   - Check console for errors
   - Test on mobile viewport
   - Verify TypeScript compiles

3. **Update Documentation:**
   - Update implementation status
   - Add API documentation if needed
   - Update this guide if setup changes

### After Completing Feature

1. **Update Status:**

   ```
   Edit docs/progress/implementation-status.md
   Change ❌ to ✅ for completed items
   ```

2. **Commit Changes:**
   ```powershell
   git add .
   git commit -m "feat: description of feature"
   git push origin feature/feature-name
   ```

---

## Troubleshooting

### Common Issues

**Port 3000 already in use:**

```powershell
# Use a different port
PORT=3001 yarn dev
```

**Module not found errors:**

```powershell
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules, .nuxt
yarn install
```

**TypeScript errors:**

```powershell
# Regenerate types
yarn nuxi prepare
```

**Database connection issues:**

- Verify `.env` credentials are correct
- Check network/firewall settings
- Confirm database is running

---

## VS Code Extensions (Recommended)

Install these extensions for better DX:

- **Vue - Official** (Vue.volar) - Vue 3 support
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript Vue Plugin** - TypeScript in Vue
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **i18n Ally** - i18n management

---

## Database Schema (To Be Created)

See:

- `/docs/database/supabase-schema.sql` (if using Supabase)
- `/docs/database/cosmos-schema.md` (if using Cosmos DB)

These files will contain:

- Table/Collection definitions
- Indexes
- Relationships
- Initial seed data
- Migration scripts

---

## Next Steps

1. ✅ Complete environment setup
2. ✅ Choose database (Supabase or Cosmos DB)
3. ✅ Set up database schema
4. ✅ Configure authentication
5. ✅ Install additional modules (i18n, Pinia, etc.)
6. ✅ Create initial folder structure
7. ✅ Start implementing features (follow implementation-status.md)

---

## Resources

- **Nuxt Documentation:** https://nuxt.com/docs
- **Nuxt UI:** https://ui.nuxt.com/
- **Supabase Docs:** https://supabase.com/docs
- **Azure Cosmos DB:** https://learn.microsoft.com/azure/cosmos-db/
- **TypeScript:** https://www.typescriptlang.org/docs/

---

**Need Help?**

- Check `/docs/requirements.md` for feature specifications
- Read `.kiki-packaging.instructions.md` for coding guidelines
- Review `/docs/progress/implementation-status.md` for current status
