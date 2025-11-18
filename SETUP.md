# MediVault Healthcare Management System - Local Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- **Node.js** (version 20.x or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (version 15 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** (comes with Node.js)
- **Git** (optional, for version control)

## Initial Setup

### 1. Clone/Download the Project

Download or clone the project files to your local machine.

```bash
# If using git
git clone <your-repository-url>
cd medivault

# Or extract the downloaded ZIP file
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Option A: Using Local PostgreSQL

1. **Start PostgreSQL Service**

   - **Windows**: Start PostgreSQL from Services or pgAdmin
   - **macOS**: `brew services start postgresql@15`
   - **Linux**: `sudo systemctl start postgresql`

2. **Create Database**

   ```bash
   # Connect to PostgreSQL
   psql -U postgres

   # Create database and user
   CREATE DATABASE medivault;
   CREATE USER medivault_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE medivault TO medivault_user;
   \q
   ```

3. **Set Environment Variables**

   Create a `.env` file in the root directory:

   ```env
   # Database Configuration
   DATABASE_URL=postgresql://medivault_user:your_secure_password@localhost:5432/medivault

   # Session Configuration
   SESSION_SECRET=your-super-secret-session-key-change-this-in-production

   # Application Configuration
   NODE_ENV=development
   PORT=5000
   ```

#### Option B: Using PostgreSQL in Docker

```bash
# Pull and run PostgreSQL container
docker run --name medivault-postgres \
  -e POSTGRES_DB=medivault \
  -e POSTGRES_USER=medivault_user \
  -e POSTGRES_PASSWORD=your_secure_password \
  -p 5432:5432 \
  -d postgres:15

# Then use the same DATABASE_URL in .env
DATABASE_URL=postgresql://medivault_user:your_secure_password@localhost:5432/medivault
```

### 4. Initialize Database Schema

Run the database migrations to create all tables:

```bash
npm run db:push
```

This will create all the necessary tables based on the schema defined in `shared/schema.ts`.

### 5. Verify Database Setup

Connect to your database and verify tables were created:

```bash
psql -U medivault_user -d medivault

# List all tables
\dt

# You should see tables like:
# - users
# - sessions
# - patients
# - doctors
# - appointments
# - prescriptions
# - etc.
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start on `http://localhost:5000`

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Database Management

### Viewing Database Schema

All database tables are defined in `shared/schema.ts`. Key tables include:

- **users** - User accounts with role-based access
- **patients** - Patient information and health records
- **doctors** - Doctor profiles and specializations
- **appointments** - Appointment scheduling
- **prescriptions** - Prescription management
- **medicines** - Medicine inventory
- **labTests** - Laboratory test results
- **bills** - Billing and payments

### Database Migrations

When you modify the schema:

1. Update `shared/schema.ts`
2. Run `npm run db:push` to apply changes

### Manual Database Operations

```bash
# Connect to database
psql -U medivault_user -d medivault

# Example queries
SELECT * FROM users;
SELECT * FROM patients;
SELECT * FROM appointments WHERE status = 'pending';
```

## Troubleshooting

### Database Connection Issues

1. **Check PostgreSQL is running:**

   ```bash
   # macOS/Linux
   pg_isready

   # Windows
   # Check Services for PostgreSQL service status
   ```

2. **Verify connection string:**

   - Ensure `DATABASE_URL` in `.env` is correct
   - Check username, password, host, and database name

3. **Check firewall/network:**
   ```bash
   # Test connection
   telnet localhost 5432
   ```

### Port Already in Use

If port 5000 is already in use:

1. Change `PORT` in `.env` to another port (e.g., 3000, 8080)
2. Restart the application

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Schema Issues

```bash
# Reset database (WARNING: This deletes all data)
psql -U medivault_user -d medivault -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run db:push
```

## Authentication Notes

This project uses **Local Authentication** with Passport.js and bcrypt:

- **Username/Password Authentication**: Secure login system
- **Session Management**: PostgreSQL-backed sessions
- **Password Hashing**: Bcrypt encryption
- **User Registration**: API endpoint for new users

See `LOCAL_AUTH_README.md` for complete authentication documentation.

### Default Admin Credentials

```bash
npm run create-admin
```

**Login Credentials:**

- Username: `admin`
- Password: `admin123`

## Project Structure

```
medivault/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # React hooks
│   │   └── lib/         # Utilities
├── server/              # Backend Express server
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database operations
│   └── db.ts            # Database connection
├── shared/              # Shared code
│   └── schema.ts        # Database schema
└── .env                 # Environment variables
```

## Development Workflow

1. **Make changes** to frontend (`client/src`) or backend (`server/`)
2. **Hot reload** automatically refreshes the application
3. **Test changes** in the browser at `http://localhost:5000`
4. **Database changes** require running `npm run db:push`

## Production Deployment

For deploying to production:

1. Build the application: `npm run build`
2. Set up PostgreSQL database
3. Configure environment variables
4. Start production server: `npm start`
5. Consider using a process manager like PM2
6. Set up reverse proxy with Nginx or Apache
7. Enable HTTPS with SSL certificates

### Recommended Hosting Platforms

- **Render.com** - Easy deployment with PostgreSQL
- **Railway.app** - Simple setup with database provisioning
- **DigitalOcean** - App Platform or Droplet
- **Heroku** - With Heroku Postgres
- **AWS** - EC2 + RDS or Elastic Beanstalk
- **Azure** - App Service + Azure Database

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Passport.js Documentation](http://www.passportjs.org/)

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the database schema in `shared/schema.ts`
3. Check console logs for error messages
4. Verify all environment variables are set correctly
