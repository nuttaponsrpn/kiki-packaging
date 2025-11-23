# Kiki Packaging Backoffice - Requirements Specification

**Version:** 1.0  
**Date:** November 23, 2025  
**Project:** Packaging Order Management System

---

## 1. Project Overview

### Purpose

A comprehensive backoffice web application for managing packaging orders at Kiki store. The system enables staff to create orders for packaging materials, track order history, maintain a packaging product catalog, and view detailed activity logs of all system actions.

### Goals

- Track who ordered which packaging products and when
- Maintain a complete audit trail of all activities
- Manage packaging product catalog
- User authentication and role-based access control
- Generate reports on packaging usage

### Target Users

- **Staff:** Create and view orders, view packaging catalog
- **Administrators:** Full access including user management, reports, and system configuration

---

## 2. User Authentication & Management

### Authentication Requirements

- Secure login system with email and password
- Session management with auto-logout on inactivity
- Password hashing for security (never store plain text)
- "Remember me" functionality (optional)
- Logout capability from any page

### User Roles & Permissions

#### Admin Role

- **Full system access**
- Create, edit, delete users
- Assign roles to users
- Access all orders (own and others)
- Delete orders and logs
- Access all reports and analytics
- Manage packaging catalog

#### Staff Role

- **Limited access**
- Create orders (tracked to their user account)
- View own orders
- View packaging catalog (read-only or limited edit)
- View own activity logs
- Access basic reports

### User Profile

- Name
- Email address
- Password (hashed)
- Role (Admin or Staff)
- Active/Inactive status
- Created date
- Last login timestamp

---

## 3. Core Pages & Navigation

### Public Pages

- `/login` - Login page (no authentication required)

### Protected Pages (Require Authentication)

#### Dashboard

- **Route:** `/dashboard`
- **Purpose:** Overview and quick access to key information
- **Access:** All authenticated users

#### Orders

- **Route:** `/orders` - Order list
- **Route:** `/orders/new` - Create new order
- **Route:** `/orders/[id]` - View/edit order details
- **Access:** All authenticated users

#### Packaging Catalog

- **Route:** `/packaging` - Packaging products list
- **Access:** All authenticated users (view), Admin (edit)

#### Activity Logs

- **Route:** `/logs` - Activity log viewer
- **Access:** All authenticated users (view own), Admin (view all)

#### User Management

- **Route:** `/users` - User list and management
- **Access:** Admin only

#### Profile

- **Route:** `/profile` - Current user profile
- **Access:** All authenticated users (own profile only)

#### Reports (Optional Phase)

- **Route:** `/reports` - Reports and analytics
- **Access:** Staff (limited), Admin (full)

---

## 4. Data Models

### User

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string; // hashed
  role: "admin" | "staff";
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
}
```

### Packaging Product

```typescript
interface PackagingProduct {
  id: string;
  name: string;
  description: string;
  sku: string;
  unit: string; // e.g., 'box', 'roll', 'piece'
  stockQuantity: number;
  imageUrl: string | null;
  category: string | null; // optional categorization
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Order

```typescript
interface Order {
  id: string;
  orderNumber: string; // auto-generated (e.g., ORD-20251123-001)
  userId: string; // who created the order
  items: OrderItem[];
  totalQuantity: number; // sum of all item quantities
  status: "pending" | "processing" | "completed" | "cancelled";
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItem {
  packagingProductId: string;
  packagingProductName: string; // denormalized for history
  quantity: number;
  unit: string; // denormalized for history
}
```

### Activity Log

```typescript
interface ActivityLog {
  id: string;
  userId: string;
  userName: string; // denormalized for quick display
  actionType: "login" | "create" | "update" | "delete" | "view";
  resourceType: "order" | "packaging" | "user" | "system";
  resourceId: string | null;
  description: string; // human-readable description
  metadata: Record<string, any> | null; // additional context
  ipAddress: string | null;
  timestamp: Date;
}
```

---

## 5. Functional Requirements

### 5.1 Dashboard Features

**Key Metrics Display:**

- Total orders created today
- Pending orders count
- Orders completed this week
- Top 5 most ordered packaging items (this month)

**Recent Activity:**

- Last 10 activity log entries
- Quick view of recent orders

**Quick Actions:**

- "Create New Order" button
- "View All Orders" button
- "Manage Packaging" button (if admin)

**Optional:**

- Charts showing order trends
- Stock level warnings

### 5.2 Order Management Features

**Order List (`/orders`):**

- Display all orders in a data table
- Columns: Order Number, Created By, Date, Items Count, Status
- **Search:** By order number, user name, packaging product name
- **Filters:**
  - Status (Pending, Processing, Completed, Cancelled)
  - Date range
  - Created by (user)
- **Sort:** By any column (date, order number, status)
- **Pagination:** 20 orders per page
- **Actions:** View details, Quick status change

**Create Order (`/orders/new`):**

- Form with fields:
  - Select packaging products (searchable dropdown or modal)
  - Quantity for each selected product
  - Notes (optional textarea)
- Add multiple packaging items to one order
- Validation:
  - At least one item required
  - Quantity must be > 0
  - Stock check (optional warning if low stock)
- Auto-generate order number on save
- Auto-log order creation activity
- Redirect to order details after creation

**Order Details (`/orders/[id]`):**

- Display all order information:
  - Order number
  - Created by (user name)
  - Created date
  - Status
  - List of packaging items with quantities
  - Notes
  - Activity history for this order
- **Actions:**
  - Edit order (if status is Pending and user is creator or admin)
  - Change status (Processing → Completed, or Cancel)
  - Delete order (admin only, with confirmation)
- **Activity Logging:**
  - Log all status changes
  - Log edits
  - Log deletions

**Order Status Flow:**

```
Pending → Processing → Completed
   ↓
Cancelled (from Pending or Processing)
```

### 5.3 Packaging Catalog Features

**Packaging List (`/packaging`):**

- Display packaging products as cards or table
- Show: Image, Name, SKU, Stock Quantity, Unit, Active status
- **Search:** By name or SKU
- **Filters:**
  - Active/Inactive
  - Category (if implemented)
  - Low stock (< threshold)
- **Sort:** By name, stock quantity, date added
- **Actions:**
  - Add new product (admin only)
  - Edit product (admin only)
  - Deactivate product (admin only)

**Add/Edit Packaging Product:**

- Form fields:
  - Name (required)
  - Description (optional)
  - SKU (required, unique)
  - Unit (required)
  - Stock quantity (required, number)
  - Image upload (optional)
  - Category (optional)
  - Active status (checkbox)
- Validation:
  - Name and SKU required
  - SKU must be unique
  - Stock quantity must be ≥ 0
- Auto-log creation/updates

**Product Deactivation:**

- Soft delete (set isActive = false)
- Inactive products don't show in order creation dropdowns
- Inactive products still visible in historical orders
- Admin can reactivate products

**Optional Features:**

- Auto-decrement stock when order is completed
- Low stock warnings (< 10 units)
- Stock adjustment log

### 5.4 Activity Logging Features

**Activity Log Viewer (`/logs`):**

- Display all activity logs in a table
- Columns: Timestamp, User, Action, Resource, Description
- **Filters:**
  - User (dropdown)
  - Action type (Login, Create, Update, Delete, View)
  - Resource type (Order, Packaging, User, System)
  - Date range
- **Search:** By description text
- **Sort:** By timestamp (default: newest first)
- **Pagination:** 50 logs per page
- **Export:** Download logs as CSV (admin only)

**Auto-Logged Actions:**

- User login
- User logout
- Order created
- Order updated (status change, edit)
- Order deleted
- Packaging product created
- Packaging product updated
- Packaging product deactivated
- User created (admin action)
- User updated (admin action)
- User role changed (admin action)

**Log Entry Example:**

```
User: John Doe
Action: Create
Resource: Order
Description: Created order ORD-20251123-001 with 3 items (Box - 10, Roll - 5, Bag - 20)
Timestamp: 2025-11-23 14:30:45
```

### 5.5 User Management Features (Admin Only)

**User List (`/users`):**

- Display all users in a table
- Columns: Name, Email, Role, Status, Created Date, Last Login
- **Search:** By name or email
- **Filters:**
  - Role (Admin, Staff)
  - Status (Active, Inactive)
- **Sort:** By name, created date, last login
- **Actions:**
  - Add new user
  - Edit user
  - Deactivate user

**Add User:**

- Form fields:
  - Name (required)
  - Email (required, unique, valid format)
  - Password (required, min 8 characters)
  - Role (required, select: Admin or Staff)
- Validation:
  - Email must be unique
  - Password strength requirements
- Auto-log user creation

**Edit User:**

- Update name, email, role
- Change password (separate action)
- Activate/Deactivate user
- Auto-log changes

**Permission Checks:**

- Only admins can access `/users` route
- Redirect non-admins to dashboard
- Show 403 error if unauthorized

### 5.6 Profile Features

**View Profile (`/profile`):**

- Display current user information:
  - Name
  - Email
  - Role
  - Account created date
  - Last login

**Edit Profile:**

- Update name
- Update email
- Change password
- Form validation
- Auto-log profile updates

**Activity History:**

- Show user's own activity logs (last 50 entries)

---

## 6. Technical Requirements

### 6.1 Frontend

**Framework & Language:**

- Nuxt 4.2.1
- TypeScript
- Vue 3 Composition API

**UI Framework:**

- Nuxt UI 4.2.1 (Tailwind-based components)
- Responsive design (mobile, tablet, desktop)

**State Management:**

- Pinia (for complex global state if needed)
- Composables for data fetching/mutations

**Routing:**

- Nuxt auto-routing
- Route middleware for authentication

**Internationalization:**

- @nuxtjs/i18n
- Support Thai and English languages

### 6.2 Backend & Database

**Database Options:**

- **Option A: Supabase** (Recommended for rapid development)
  - Built-in auth
  - Real-time capabilities
  - Storage for images
  - PostgreSQL database
- **Option B: Azure Cosmos DB**
  - Enterprise-grade scalability
  - Global distribution
  - Requires separate auth solution

**API Layer:**

- Nuxt server routes (`/server/api/`)
- RESTful endpoints
- Proper error handling
- Input validation

**Database Schema:**

- Users table/collection
- Packaging products table/collection
- Orders table/collection
- Activity logs table/collection
- Proper indexes for performance

### 6.3 Authentication & Security

**Authentication Strategy:**

- JWT-based authentication (if using Supabase Auth or @sidebase/nuxt-auth)
- HTTP-only cookies for token storage
- CSRF protection

**Security Measures:**

- Password hashing (bcrypt or argon2)
- Input sanitization
- SQL injection prevention (parameterized queries)
- XSS protection
- HTTPS required in production

**Session Management:**

- Auto-logout after 30 minutes of inactivity (optional)
- Refresh token rotation
- Secure logout (clear all session data)

### 6.4 Additional Modules

**Required:**

- `@nuxtjs/i18n` - Internationalization
- `@pinia/nuxt` - State management
- Database module (Supabase SDK or Cosmos DB SDK)
- Auth module (@nuxtjs/supabase or @sidebase/nuxt-auth)

**Recommended:**

- `dayjs` or `date-fns` - Date manipulation
- `vee-validate` or `zod` - Form validation
- `@nuxt/image` - Already installed, use for image optimization

### 6.5 File Upload

**Packaging Product Images:**

- Upload to Supabase Storage or Azure Blob Storage
- Resize/optimize on upload
- Limit file size (< 5MB)
- Allowed formats: JPEG, PNG, WebP
- Generate thumbnail for list views

---

## 7. Non-Functional Requirements

### Performance

- Page load time < 2 seconds
- API response time < 500ms
- Optimized images and assets
- Lazy loading for images and components

### Scalability

- Support 50+ concurrent users
- Handle 1000+ orders
- Handle 100+ packaging products

### Reliability

- 99% uptime target
- Graceful error handling
- Data backup strategy
- Transaction rollback on errors

### Usability

- Intuitive navigation
- Clear error messages
- Loading indicators for async operations
- Confirmation dialogs for destructive actions
- Responsive on mobile devices

### Accessibility

- Keyboard navigation support
- ARIA labels for screen readers
- Sufficient color contrast
- Semantic HTML

---

## 8. Optional Features (Future Phases)

### Reporting & Analytics

- Daily/weekly/monthly order summaries
- Top 10 most ordered packaging items
- User activity reports
- Export reports to Excel/CSV
- Charts and visualizations

### Notifications

- Email notifications for order confirmations
- Low stock alerts
- System maintenance notifications

### Advanced Features

- Barcode/QR code scanning for packaging products
- Batch order creation (CSV import)
- Order templates (save frequently ordered combinations)
- Stock forecasting based on historical data
- Multi-location support (if multiple stores)
- Order approval workflow (requires manager approval)

---

## 9. Development Phases

### Phase 1: Setup & Infrastructure (Priority: Critical)

- Database selection and setup
- Authentication implementation
- Project structure and core modules

### Phase 2: Core Structure (Priority: Critical)

- Layouts and navigation
- Basic components
- Core composables

### Phase 3: Authentication (Priority: Critical)

- Login page
- Auth middleware
- User session management

### Phase 4: Dashboard (Priority: High)

- Basic dashboard with metrics
- Quick actions

### Phase 5: Order Management (Priority: High)

- Order list, create, view/edit
- Order status management
- Activity logging for orders

### Phase 6: Packaging Catalog (Priority: High)

- Packaging list and management
- Image upload
- Stock tracking

### Phase 7: Activity Logs (Priority: Medium)

- Log viewer with filters
- Auto-logging system
- Export functionality

### Phase 8: User Management (Priority: Medium)

- User CRUD operations (admin only)
- Role management
- Permission checks

### Phase 9: User Profile (Priority: Medium)

- Profile view and edit
- Password change
- Activity history

### Phase 10: Reporting (Priority: Low)

- Reports dashboard
- Analytics and charts
- Export capabilities

### Phase 11: Testing & Polish (Priority: High)

- Comprehensive testing
- UX improvements
- Performance optimization
- Documentation

---

## 10. Success Criteria

The project is considered successful when:

✅ Users can securely log in and out  
✅ Staff can create orders with multiple packaging items  
✅ All orders are tracked with user attribution  
✅ Complete activity log of all system actions  
✅ Admins can manage users and view all data  
✅ Packaging catalog is maintainable  
✅ System is responsive on mobile and desktop  
✅ Data is secure and properly validated  
✅ All CRUD operations work correctly  
✅ Application is deployed and accessible

---

## 11. Constraints & Assumptions

### Constraints

- Must work on modern browsers (Chrome, Firefox, Safari, Edge)
- Budget for cloud hosting (affects database choice)
- Timeline for MVP launch
- Team size and expertise

### Assumptions

- Users have basic computer literacy
- Internet connection is stable
- Single-location operation (initially)
- Thai and English language support sufficient
- Order quantities are whole numbers
- Orders cannot be edited after completion

---

## 12. Glossary

- **Backoffice:** Administrative web application (not public-facing)
- **Order:** A request for packaging materials with one or more items
- **Packaging Product:** A type of packaging material (box, roll, bag, etc.)
- **Activity Log:** Audit trail of all system actions
- **SKU:** Stock Keeping Unit - unique identifier for products
- **RBAC:** Role-Based Access Control
- **JWT:** JSON Web Token (authentication method)

---

**Document Status:** Draft  
**Next Review:** After Phase 1 completion
