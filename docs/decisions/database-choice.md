# Database Choice for Kiki Packaging Backoffice

**Decision Date:** November 23, 2025  
**Status:** 🎯 **RECOMMENDATION: Supabase**

---

## Requirements Analysis

Based on the project requirements for packaging order management:

### Data Models Needed

1. **Users** - Admin and staff accounts
2. **Packaging Products** - Catalog of packaging items
3. **Orders** - Customer packaging orders
4. **Activity Logs** - Audit trail of all actions

### Key Requirements

- ✅ CRUD operations for orders, packaging, users
- ✅ Activity logging (who ordered what, when)
- ✅ Role-based access control (admin vs staff)
- ✅ Real-time updates (optional but nice to have)
- ✅ Search and filtering
- ✅ Data relationships (orders → users, orders → packaging products)

---

## Option 1: Supabase (PostgreSQL) ⭐ **RECOMMENDED**

### Overview

Open-source Firebase alternative with PostgreSQL database, built-in auth, real-time subscriptions, and auto-generated REST/GraphQL APIs.

### Pros ✅

- **Free tier:** 500MB database, 50,000 monthly active users, 2GB file storage
- **Built-in authentication:** JWT tokens, row-level security (RLS)
- **Instant APIs:** Auto-generated REST and GraphQL APIs from schema
- **Real-time subscriptions:** Live updates when data changes
- **PostgreSQL:** Robust relational database with ACID compliance
- **Easy local development:** Docker-based local setup
- **Excellent TypeScript support:** Auto-generated types from schema
- **Activity logging:** Perfect for audit trails with triggers
- **Dashboard:** Visual database explorer and SQL editor
- **Fast setup:** Can be running in 10 minutes

### Cons ❌

- Vendor lock-in (but can self-host if needed)
- Scaling costs increase with usage
- Limited to PostgreSQL (but that's sufficient for this use case)

### Setup Complexity

**⭐⭐⭐⭐⭐ (Very Easy)**

```bash
# 1. Install Supabase CLI
npm install -g supabase
# 2. Initialize project
supabase init
# 3. Start local dev
supabase start
```

### Cost Estimate

- **MVP/Small team (1-10 users):** FREE
- **Growing (10-50 users):** $25/month (Pro plan)
- **Enterprise (50+ users):** Custom pricing

### Best For

- ✅ MVPs and startups
- ✅ Teams wanting rapid development
- ✅ Projects needing real-time features
- ✅ Teams comfortable with PostgreSQL
- ✅ **This project** (packaging order management backoffice)

---

## Option 2: Azure Cosmos DB (NoSQL)

### Overview

Microsoft's globally distributed, multi-model database service with guaranteed low latency and high availability.

### Pros ✅

- **Global distribution:** Multi-region replication
- **Low latency:** Single-digit millisecond reads/writes
- **Elastic scaling:** Auto-scale based on traffic
- **Multi-model:** SQL API, MongoDB API, Cassandra, Gremlin, Table
- **High availability:** 99.999% SLA
- **Enterprise-grade:** Microsoft Azure ecosystem integration

### Cons ❌

- **Complex pricing:** Request Units (RU/s) can be confusing
- **Higher initial cost:** Minimum ~$24/month for production
- **Steeper learning curve:** RU optimization, partition key design
- **Over-engineered for this use case:** We don't need global distribution
- **More setup:** Azure account, resource groups, networking
- **Limited free tier:** Only 1000 RU/s free (not enough for active development)

### Setup Complexity

**⭐⭐ (Complex)**

```bash
# 1. Azure account setup
# 2. Create resource group
# 3. Create Cosmos DB account (5-10 min provisioning)
# 4. Configure networking/firewall
# 5. Install Azure SDK
# 6. Configure connection strings
```

### Cost Estimate

- **Development:** $24/month minimum (400 RU/s)
- **Production (small):** $60-100/month
- **Production (medium):** $200-500/month

### Best For

- ✅ Enterprise applications
- ✅ Global applications (multi-region users)
- ✅ IoT/high-throughput scenarios
- ✅ Teams already on Azure ecosystem
- ❌ **Not ideal for this project** (overkill for backoffice app)

---

## Direct Comparison

| Feature                   | Supabase              | Azure Cosmos DB                |
| ------------------------- | --------------------- | ------------------------------ |
| **Setup Time**            | 10 minutes            | 1-2 hours                      |
| **Free Tier**             | ✅ Generous           | ⚠️ Limited (1000 RU/s)         |
| **Learning Curve**        | Easy                  | Steep                          |
| **Development Speed**     | Fast (auto APIs)      | Slower (manual setup)          |
| **Local Development**     | ✅ Excellent (Docker) | ⚠️ Emulator exists but complex |
| **Authentication**        | ✅ Built-in           | ❌ Separate (Azure AD)         |
| **Real-time**             | ✅ Built-in           | ❌ Requires Change Feed setup  |
| **Activity Logging**      | ✅ Easy (triggers)    | ✅ Possible (Change Feed)      |
| **TypeScript Support**    | ✅ Auto-generated     | ⚠️ Manual types                |
| **Cost (MVP)**            | $0                    | $24/month                      |
| **Cost (Production)**     | $25-50/month          | $100-500/month                 |
| **Global Distribution**   | ❌ No                 | ✅ Yes                         |
| **Best for this project** | ✅ YES                | ❌ Overkill                    |

---

## Recommendation: Choose Supabase ✅

### Why Supabase is Better for Kiki Packaging Backoffice

1. **Perfect fit for requirements:**

   - PostgreSQL handles relational data (orders → users → products) naturally
   - Built-in auth matches our JWT pattern
   - Activity logging is straightforward with triggers
   - Real-time subscriptions for live order updates

2. **Development speed:**

   - Auto-generated APIs from schema
   - Auto-generated TypeScript types
   - Visual database editor
   - No backend code needed initially

3. **Cost-effective:**

   - Free during development
   - Predictable pricing as you scale
   - No surprise bills from RU consumption

4. **Team-friendly:**

   - Lower learning curve
   - Better documentation for startups
   - Active community support
   - Easy to hand off to other developers

5. **Future-proof:**
   - Can self-host if needed (open source)
   - Export data easily (PostgreSQL)
   - Migrate to other PostgreSQL providers if needed

### When to Choose Cosmos DB Instead

Only choose Cosmos DB if you have:

- ❌ Existing Azure infrastructure requirement
- ❌ Global user base across multiple regions
- ❌ Need for 99.999% SLA
- ❌ Enterprise compliance requirements (SOC 2, HIPAA, etc.)
- ❌ Budget for $100+/month database costs

**For this project:** None of these apply.

---

## Next Steps with Supabase

### 1. Create Supabase Project (5 minutes)

```bash
# Visit https://supabase.com
# Click "Start your project"
# Create organization & project
# Save connection details
```

### 2. Install Supabase Client (2 minutes)

```bash
yarn add @supabase/supabase-js
```

### 3. Configure Environment Variables

```bash
NUXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Create Database Schema (15 minutes)

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Packaging products catalog
CREATE TABLE public.packaging_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  unit_price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) NOT NULL,
  packaging_product_id UUID REFERENCES public.packaging_products(id) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs (audit trail)
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- Row Level Security (RLS) policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packaging_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Example policy: Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can see all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 5. Create Supabase Composable (10 minutes)

```typescript
// app/composables/useSupabase.ts
import { createClient } from "@supabase/supabase-js";

export const useSupabase = () => {
  const config = useRuntimeConfig();

  const supabase = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey);

  return supabase;
};
```

### 6. Generate TypeScript Types (5 minutes)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Generate types
supabase gen types typescript --project-id your-project-ref > app/types/database.ts
```

---

## Decision Matrix

| Criteria              | Weight   | Supabase   | Cosmos DB  |
| --------------------- | -------- | ---------- | ---------- |
| **Setup Speed**       | 20%      | 10/10      | 4/10       |
| **Development Speed** | 20%      | 10/10      | 6/10       |
| **Cost (MVP)**        | 15%      | 10/10      | 3/10       |
| **Learning Curve**    | 15%      | 9/10       | 4/10       |
| **Feature Match**     | 15%      | 10/10      | 7/10       |
| **Scalability**       | 10%      | 8/10       | 10/10      |
| **Community Support** | 5%       | 9/10       | 7/10       |
| \***\*TOTAL SCORE**   | **100%** | **9.4/10** | **5.5/10** |

---

## Final Recommendation

### 🎯 **Choose Supabase**

**Confidence Level:** 95%

**Reasoning:**

1. Perfect fit for backoffice order management
2. 3x faster development time
3. Free during development
4. Better for small teams
5. Easier to learn and maintain
6. Real-time features out of the box
7. Can always migrate later if needed

**Only choose Cosmos DB if:** Your organization mandates Azure or you have specific enterprise requirements.

---

## Implementation Timeline with Supabase

- **Day 1:** Create Supabase project, install dependencies (30 min)
- **Day 1:** Create database schema (1 hour)
- **Day 1:** Set up RLS policies (1 hour)
- **Day 2:** Generate TypeScript types (15 min)
- **Day 2:** Create useSupabase composable (30 min)
- **Day 2:** Create data composables (useOrders, usePackaging, etc.) (2 hours)
- **Day 3:** Test CRUD operations (2 hours)
- **Day 3:** Implement activity logging (1 hour)

**Total:** ~8 hours to full database integration

vs. Cosmos DB: ~16-20 hours

---

**Decision:** ✅ **Proceed with Supabase**
