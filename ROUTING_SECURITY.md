# MediVault - Routing & Security Configuration

## ✅ Complete Routing System Fixed

All routing issues have been resolved and the application now has proper authentication, authorization, and secure routing for all user roles.

---

## 🔐 Authentication & Authorization

### Authentication System

- **Type**: Session-based with Passport.js Local Strategy
- **Password Hashing**: bcrypt with salt rounds
- **Session Storage**: PostgreSQL (secure, persistent)
- **Session Duration**: 7 days
- **Cookie Settings**: HttpOnly, Secure in production

### User Roles

1. **Admin** - Full system access
2. **Doctor** - Medical operations
3. **Patient** - Personal health records
4. **Pharmacist** - Medicine inventory
5. **Lab Technician** - Lab tests & results

---

## 🛡️ Security Fixes Applied

### 1. Backend User ID Access (CRITICAL FIX)

**Problem**: Routes were using `req.user.claims.sub` (Replit format) instead of `req.user.id`

**Fixed Routes**:

- ✅ `/api/patients` - Patient creation
- ✅ `/api/doctors` - Doctor creation
- ✅ `/api/appointments` - Appointment fetching
- ✅ `/api/medical-records` - Medical records
- ✅ `/api/prescriptions` - Prescription access
- ✅ `/api/lab-tests` - Lab test queries
- ✅ `/api/bills` - Billing information
- ✅ `/api/notifications` - User notifications
- ✅ `/api/messages/:userId` - Chat messages
- ✅ `/api/messages` - Message creation

**Impact**: Users can now properly access their own data without authentication errors.

---

### 2. Frontend Login Redirects (CRITICAL FIX)

**Problem**: Pages redirected to `/api/login` (API endpoint) instead of `/login` (login page)

**Fixed Pages**:

- ✅ `dashboard.tsx`
- ✅ `appointments.tsx` (2 instances)
- ✅ `medical-records.tsx`
- ✅ `prescriptions.tsx`
- ✅ `notifications.tsx`
- ✅ `messages.tsx`

**Impact**: Unauthorized users now properly redirected to the login page.

---

### 3. Role-Based Authorization Middleware (NEW FEATURE)

#### Available Middleware Functions

```typescript
// Basic authentication
isAuthenticated        // Any logged-in user

// Single role checks
isAdmin               // Admin only
isDoctor              // Doctor only
isPatient             // Patient only
isPharmacist          // Pharmacist only
isLabTechnician       // Lab Technician only

// Combined role checks
isDoctorOrAdmin       // Doctor OR Admin
isPharmacistOrAdmin   // Pharmacist OR Admin
isLabTechOrAdmin      // Lab Technician OR Admin

// Custom role check
hasRole("role1", "role2", ...)  // Any of the specified roles
```

#### Protected Routes by Role

**Doctor & Admin Only**:

- `POST /api/medical-records` - Create medical records
- `POST /api/prescriptions` - Issue prescriptions
- `POST /api/lab-tests` - Order lab tests

**Pharmacist & Admin Only**:

- `POST /api/medicines` - Add medicines to inventory
- `PATCH /api/medicines/:id/stock` - Update medicine stock

**Lab Technician & Admin Only**:

- `PATCH /api/lab-tests/:id` - Update lab test results

**All Authenticated Users**:

- `GET /api/patients` - View patients
- `GET /api/doctors` - View doctors
- `GET /api/appointments` - View own appointments
- `GET /api/medical-records` - View own records
- `GET /api/prescriptions` - View own prescriptions
- `GET /api/bills` - View own bills
- `GET /api/notifications` - View own notifications
- `GET /api/messages/:userId` - View own messages

---

### 4. WebSocket Security (NEW FEATURE)

**Previous State**: WebSocket connections were completely open, no authentication

**New Security**:

- ✅ Session-based authentication required
- ✅ Connection rejected if not authenticated
- ✅ User ID tracked with each WebSocket connection
- ✅ Messages tagged with sender ID and timestamp
- ✅ Only authenticated clients receive broadcasts
- ✅ Proper error handling and logging

**WebSocket Connection Flow**:

1. Client attempts WebSocket connection
2. Server validates session from request
3. If authenticated: Connection established, user ID stored
4. If not authenticated: Connection closed with code 1008
5. All messages include sender ID and timestamp
6. Messages only broadcast to authenticated clients

---

## 🔒 Authorization Matrix

| Route                     | Patient | Doctor | Pharmacist | Lab Tech | Admin |
| ------------------------- | ------- | ------ | ---------- | -------- | ----- |
| **Appointments**          |         |        |            |          |       |
| Create appointment        | ✅      | ✅     | ✅         | ✅       | ✅    |
| View own appointments     | ✅      | ✅     | ✅         | ✅       | ✅    |
| Update appointment status | ✅      | ✅     | ✅         | ✅       | ✅    |
| **Medical Records**       |         |        |            |          |       |
| Create medical record     | ❌      | ✅     | ❌         | ❌       | ✅    |
| View own records          | ✅      | ✅     | ❌         | ❌       | ✅    |
| **Prescriptions**         |         |        |            |          |       |
| Issue prescription        | ❌      | ✅     | ❌         | ❌       | ✅    |
| View own prescriptions    | ✅      | ✅     | ❌         | ❌       | ✅    |
| **Medicines**             |         |        |            |          |       |
| Add medicine              | ❌      | ❌     | ✅         | ❌       | ✅    |
| Update stock              | ❌      | ❌     | ✅         | ❌       | ✅    |
| View medicines            | ✅      | ✅     | ✅         | ✅       | ✅    |
| **Lab Tests**             |         |        |            |          |       |
| Order lab test            | ❌      | ✅     | ❌         | ❌       | ✅    |
| Update test results       | ❌      | ❌     | ❌         | ✅       | ✅    |
| View own tests            | ✅      | ✅     | ❌         | ✅       | ✅    |
| **Bills & Payments**      |         |        |            |          |       |
| Create bill               | ✅      | ✅     | ✅         | ✅       | ✅    |
| View own bills            | ✅      | ✅     | ✅         | ✅       | ✅    |
| Create payment            | ✅      | ✅     | ✅         | ✅       | ✅    |
| **Notifications**         |         |        |            |          |       |
| View own notifications    | ✅      | ✅     | ✅         | ✅       | ✅    |
| Mark as read              | ✅      | ✅     | ✅         | ✅       | ✅    |
| **Messages (Chat)**       |         |        |            |          |       |
| Send message              | ✅      | ✅     | ✅         | ✅       | ✅    |
| View messages             | ✅      | ✅     | ✅         | ✅       | ✅    |
| WebSocket chat            | ✅      | ✅     | ✅         | ✅       | ✅    |

---

## 🚀 How to Use Role-Based Middleware

### Example: Protecting a Route

```typescript
// Before (no role protection)
app.post("/api/prescriptions", isAuthenticated, async (req, res) => {
  // Anyone logged in could create prescriptions
});

// After (role-based protection)
app.post("/api/prescriptions", isDoctorOrAdmin, async (req, res) => {
  // Only doctors and admins can create prescriptions
});
```

### Example: Custom Role Check

```typescript
// Allow multiple specific roles
app.post(
  "/api/custom-route",
  hasRole("doctor", "nurse", "admin"),
  async (req, res) => {
    // Only doctors, nurses, or admins can access
  }
);
```

---

## 📊 Security Response Codes

| Code    | Meaning      | When It Happens                        |
| ------- | ------------ | -------------------------------------- |
| **200** | Success      | Request completed successfully         |
| **201** | Created      | Resource created successfully          |
| **400** | Bad Request  | Invalid data provided                  |
| **401** | Unauthorized | Not logged in / session expired        |
| **403** | Forbidden    | Logged in but insufficient permissions |
| **404** | Not Found    | Resource doesn't exist                 |
| **500** | Server Error | Internal server error                  |

---

## 🔧 Testing Authentication & Authorization

### Test User Login

```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Test Protected Route (Without Login)

```bash
curl http://localhost:5000/api/patients
# Response: 401 Unauthorized
```

### Test Role Protection

```bash
# Login as patient
curl -c cookies.txt -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "patient1", "password": "password"}'

# Try to create prescription (should fail - requires doctor)
curl -b cookies.txt -X POST http://localhost:5000/api/prescriptions \
  -H "Content-Type: application/json" \
  -d '{...}'
# Response: 403 Forbidden
```

---

## ✅ Verification Checklist

All items completed:

- [x] Fixed `req.user.claims.sub` → `req.user.id` in all routes
- [x] Fixed frontend redirects from `/api/login` → `/login`
- [x] Created role-based middleware functions
- [x] Applied role protection to medical routes
- [x] Applied role protection to pharmacy routes
- [x] Applied role protection to lab routes
- [x] Secured WebSocket connections
- [x] Added user ID tracking to WebSocket messages
- [x] Server compiles without errors
- [x] Server runs successfully
- [x] Documentation created

---

## 🎯 Next Steps (Optional Enhancements)

1. **Rate Limiting**: Add rate limiting to prevent brute force attacks
2. **Audit Logging**: Log all sensitive operations (medical records access, etc.)
3. **2FA**: Implement two-factor authentication for admin users
4. **Password Reset**: Email-based password reset functionality
5. **Account Lockout**: Lock accounts after failed login attempts
6. **CSRF Protection**: Add CSRF tokens to forms
7. **API Keys**: Allow programmatic access with API keys
8. **IP Whitelisting**: Restrict admin access to specific IPs

---

## 📚 Related Documentation

- `LOCAL_AUTH_README.md` - Authentication system details
- `SETUP.md` - Project setup guide
- `DATABASE.md` - Database schema and relationships
- `REPLIT_REMOVAL_SUMMARY.md` - Migration from Replit

---

**Last Updated**: November 18, 2025  
**Status**: ✅ All routing and security issues resolved  
**Version**: 2.0 - Secure & Role-Based
