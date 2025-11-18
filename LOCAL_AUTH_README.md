# MediVault - Local Authentication Setup

## ✅ Replit Auth Removed - Local Auth Implemented

All Replit authentication has been completely removed and replaced with a robust local authentication system using **Passport.js** and **bcrypt**.

---

## 🔐 Authentication System

### Technology Stack

- **Passport.js** - Authentication middleware
- **bcryptjs** - Password hashing
- **express-session** - Session management
- **PostgreSQL** - Session and user storage

### Features

- ✅ Username/Password authentication
- ✅ Secure password hashing with bcrypt
- ✅ Session-based authentication
- ✅ PostgreSQL session storage
- ✅ User registration endpoint
- ✅ Logout functionality
- ✅ Protected API routes

---

## 🚀 Getting Started

### 1. Database Schema

The users table has been updated with:

- `username` (unique, required)
- `password` (hashed, required)
- `email` (unique, optional)
- `firstName`, `lastName`
- `role` (patient, doctor, pharmacist, lab_technician, admin)

### 2. Create Admin User

Run this command to create the default admin user:

```bash
npm run create-admin
```

**Default Admin Credentials:**

```
Username: admin
Password: admin123
```

⚠️ **Important**: Change the password after first login!

---

## 📋 API Endpoints

### Authentication Routes

#### POST `/api/login`

Login with username and password

**Request Body:**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "user": {
    "id": "...",
    "username": "admin",
    "email": "admin@medivault.local",
    "role": "admin",
    "firstName": "Admin",
    "lastName": "User"
  }
}
```

#### POST `/api/register`

Register a new user

**Request Body:**

```json
{
  "username": "newuser",
  "password": "password123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "patient"
}
```

#### POST `/api/logout`

Logout the current user

#### GET `/api/auth/user`

Get the currently authenticated user

---

## 🔧 Configuration

### Environment Variables (.env)

```env
DATABASE_URL=postgresql://medivault:Alpha@localhost:5432/medivault
SESSION_SECRET=medivault-super-secret-session-key-change-in-production-2024
NODE_ENV=development
PORT=5000
```

### Database Connection

Changed from **Neon Serverless** to **standard PostgreSQL**:

- Removed `@neondatabase/serverless`
- Added `pg` (node-postgres)
- Updated `drizzle-orm` imports

---

## 📁 File Changes

### New Files

- `server/localAuth.ts` - Complete authentication implementation
- `scripts/create-admin.ts` - Admin user creation script
- `client/src/pages/login.tsx` - Login page component

### Modified Files

- `server/db.ts` - Updated to use standard PostgreSQL
- `server/routes.ts` - Uses local auth instead of Replit auth
- `server/index.ts` - Added session middleware
- `shared/schema.ts` - Added username and password fields
- `client/src/App.tsx` - Added login route
- `client/src/pages/landing.tsx` - Updated login links
- `client/src/components/app-sidebar.tsx` - Added logout button
- `package.json` - Added create-admin script, cross-env

### Deleted/Unused Files

- `server/replitAuth.ts` - No longer used (kept for reference, can be deleted)

---

## 🎨 Frontend Changes

### Login Page

- Clean, modern login UI with Shadcn components
- Username/password form
- Error handling
- Auto-redirect to dashboard on success
- Shows demo credentials

### Navigation Updates

- All `/api/login` redirects changed to `/login`
- Logout button added to sidebar
- Proper session handling

---

## 🔒 Security Features

1. **Password Hashing**: All passwords hashed with bcrypt (10 salt rounds)
2. **Session Management**: Secure sessions stored in PostgreSQL
3. **HTTP-only Cookies**: Session cookies are HTTP-only
4. **CSRF Protection**: Can be added with `csurf` middleware
5. **Role-based Access**: User roles enforced in routes

---

## 🧪 Testing

### Test Login Flow

1. Start the server: `npm run dev`
2. Navigate to: `http://localhost:5000`
3. Click "Sign In" or "Get Started"
4. Login with:
   - Username: `admin`
   - Password: `admin123`
5. You should be redirected to the dashboard

### Create Additional Users

Use the registration endpoint or add users through the admin panel once implemented.

---

## 📦 NPM Scripts

```json
{
  "dev": "cross-env NODE_ENV=development tsx server/index.ts",
  "build": "vite build && esbuild server/index.ts ...",
  "start": "cross-env NODE_ENV=production node dist/index.js",
  "db:push": "drizzle-kit push",
  "create-admin": "tsx scripts/create-admin.ts"
}
```

---

## 🛠️ Dependencies Added

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "pg": "^8.11.3",
    "cross-env": "^7.0.3",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/passport": "^1.0.16",
    "@types/passport-local": "^1.0.38",
    "@types/pg": "^8.10.9"
  }
}
```

---

## 🔄 Migration from Replit Auth

### What Was Removed

- ❌ Replit Auth OAuth flow
- ❌ OpenID Connect dependencies
- ❌ Neon serverless websocket connection
- ❌ Replit-specific environment variables

### What Was Added

- ✅ Local username/password authentication
- ✅ Passport.js strategies
- ✅ Password hashing
- ✅ Standard PostgreSQL connection
- ✅ User registration
- ✅ Login page UI

---

## 📝 Next Steps

1. **Change Default Password**: Modify admin password after first login
2. **Add Password Reset**: Implement forgot password functionality
3. **Email Verification**: Add email verification for new users
4. **2FA**: Implement two-factor authentication
5. **Rate Limiting**: Add login attempt rate limiting
6. **User Management**: Build admin panel for user CRUD operations

---

## 🆘 Troubleshooting

### Login Not Working

- Check database connection
- Verify admin user exists: `npm run create-admin`
- Check browser console for errors
- Verify session middleware is loaded

### Session Issues

- Clear browser cookies
- Check `SESSION_SECRET` is set in `.env`
- Verify sessions table exists in database

### Database Errors

- Run `npm run db:push` to update schema
- Check PostgreSQL is running
- Verify `DATABASE_URL` in `.env`

---

## 📞 Support

For issues or questions:

1. Check this README
2. Review `server/localAuth.ts` for implementation details
3. Check console logs for error messages
4. Verify all environment variables are set

---

**Last Updated**: November 17, 2025
**Version**: 2.0.0 (Local Auth)
