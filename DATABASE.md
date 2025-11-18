
# Database Setup and Management Guide

## Database Architecture

MediVault uses PostgreSQL 15+ with the following architecture:

- **ORM**: Drizzle ORM for type-safe database operations
- **Connection**: Neon serverless driver with WebSocket support
- **Schema**: Defined in TypeScript with automatic validation
- **Migrations**: Push-based schema synchronization

## Schema Overview

### Core Tables

#### 1. Authentication Tables

**sessions**
- Stores user session data (required for authentication)
- Auto-expires based on session TTL

**users**
- Central user table with role-based access
- Roles: `patient`, `doctor`, `pharmacist`, `lab_technician`, `admin`
- Links to role-specific tables

#### 2. Role-Specific Tables

**patients**
- Extends user with health information
- Fields: NIC, Health ID, RFID, blood type, allergies
- References: userId → users.id

**doctors**
- Doctor profiles with specialization
- Fields: license number, qualifications, consultation fee
- References: userId → users.id

**pharmacists**
- Pharmacist credentials
- Fields: license number
- References: userId → users.id

**lab_technicians**
- Lab technician profiles
- Fields: specialization, license number
- References: userId → users.id

#### 3. Clinical Tables

**appointments**
- Patient-doctor appointment scheduling
- Status: `pending`, `confirmed`, `completed`, `cancelled`
- References: patientId, doctorId

**medical_records**
- Medical visit records
- Fields: diagnosis, symptoms, vital signs (JSON)
- References: patientId, doctorId, appointmentId

**prescriptions**
- Prescription management with QR codes
- Status: `active`, `dispensed`, `expired`
- References: patientId, doctorId, medicalRecordId

**prescription_items**
- Individual medicines in prescriptions
- Fields: dosage, frequency, duration
- References: prescriptionId, medicineId

**lab_tests**
- Laboratory test requests and results
- Status: `pending`, `in_progress`, `completed`, `cancelled`
- References: patientId, doctorId, labTechnicianId

#### 4. Inventory Tables

**medicines**
- Medicine inventory management
- Fields: name, stock quantity, reorder level, batch number
- Supports low-stock notifications

#### 5. Financial Tables

**bills**
- Patient billing records
- Status: `pending`, `paid`, `cancelled`
- References: patientId, appointmentId

**bill_items**
- Line items in bills
- Types: `consultation`, `medicine`, `lab_test`, `procedure`
- References: billId

**payments**
- Payment transactions
- Methods: `cash`, `card`, `insurance`, `online`
- References: billId

#### 6. Communication Tables

**notifications**
- System notifications for users
- Types: `appointment`, `prescription`, `lab_result`, `low_stock`, `system`
- References: recipientId (userId)

**chat_messages**
- Direct messaging between users
- References: senderId, receiverId (both userId)

#### 7. Audit Tables

**audit_logs**
- Activity tracking and audit trail
- Tracks: action, entity type, entity ID, IP address
- References: userId

## Database Setup Steps

### Step 1: Install PostgreSQL

#### Windows
```bash
# Download installer from postgresql.org
# Or use Chocolatey
choco install postgresql15
```

#### macOS
```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql-15 postgresql-contrib-15
sudo systemctl start postgresql
```

### Step 2: Create Database

```sql
-- Connect as postgres superuser
psql -U postgres

-- Create database
CREATE DATABASE medivault;

-- Create user
CREATE USER medivault_user WITH ENCRYPTED PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE medivault TO medivault_user;

-- Grant schema permissions (PostgreSQL 15+)
\c medivault
GRANT ALL ON SCHEMA public TO medivault_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO medivault_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO medivault_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO medivault_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO medivault_user;

-- Exit
\q
```

### Step 3: Configure Connection

Create `.env` file:

```env
DATABASE_URL=postgresql://medivault_user:your_secure_password@localhost:5432/medivault
SESSION_SECRET=your-super-secret-key-min-32-characters-long
```

### Step 4: Push Schema

```bash
npm run db:push
```

This creates all tables defined in `shared/schema.ts`.

## Database Operations

### Using Drizzle ORM (Recommended)

The application uses Drizzle ORM through the storage layer in `server/storage.ts`:

```typescript
// Example: Create a new patient
const patient = await storage.createPatient({
  userId: "user-uuid",
  nic: "123456789V",
  dateOfBirth: new Date("1990-01-01"),
  gender: "male",
  bloodType: "O+",
  allergies: "None"
});

// Example: Get appointments
const appointments = await storage.getAppointmentsByPatient("patient-uuid");

// Example: Create prescription
const prescription = await storage.createPrescription({
  patientId: "patient-uuid",
  doctorId: "doctor-uuid",
  dateIssued: new Date(),
  status: "active"
});
```

### Direct SQL Queries

```typescript
// In server code
import { db } from './db';
import { sql } from 'drizzle-orm';

// Raw SQL query
const result = await db.execute(sql`
  SELECT u.*, p.* 
  FROM users u 
  JOIN patients p ON u.id = p.user_id 
  WHERE u.role = 'patient'
`);
```

### Command Line Queries

```bash
# Connect to database
psql -U medivault_user -d medivault

# List all tables
\dt

# Describe table structure
\d users
\d patients
\d appointments

# Sample queries
SELECT * FROM users LIMIT 10;
SELECT * FROM appointments WHERE status = 'pending';
SELECT COUNT(*) FROM patients;

# Exit
\q
```

## Common Database Tasks

### 1. Seed Initial Data

Create a seed script `scripts/seed.ts`:

```typescript
import { db } from '../server/db';
import { users, patients, doctors, medicines } from '../shared/schema';

async function seed() {
  // Create admin user
  const [admin] = await db.insert(users).values({
    email: 'admin@medivault.com',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin'
  }).returning();

  // Add sample medicines
  await db.insert(medicines).values([
    {
      name: 'Paracetamol',
      genericName: 'Acetaminophen',
      category: 'Pain Relief',
      dosageForm: 'tablet',
      strength: '500mg',
      unitPrice: '0.50',
      stockQuantity: 1000,
      reorderLevel: 100
    },
    // Add more medicines...
  ]);

  console.log('Database seeded successfully');
}

seed().catch(console.error);
```

Run: `tsx scripts/seed.ts`

### 2. Backup Database

```bash
# Full backup
pg_dump -U medivault_user medivault > backup_$(date +%Y%m%d).sql

# Schema only
pg_dump -U medivault_user --schema-only medivault > schema_backup.sql

# Data only
pg_dump -U medivault_user --data-only medivault > data_backup.sql
```

### 3. Restore Database

```bash
# Restore from backup
psql -U medivault_user medivault < backup_20240115.sql
```

### 4. Reset Database

```bash
# WARNING: This deletes all data!
psql -U medivault_user -d medivault -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run db:push
```

## Database Monitoring

### Check Database Size

```sql
SELECT 
  pg_size_pretty(pg_database_size('medivault')) as database_size;
```

### Check Table Sizes

```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Active Connections

```sql
SELECT 
  count(*) as active_connections
FROM pg_stat_activity
WHERE datname = 'medivault';
```

## Performance Optimization

### Indexes

Key indexes are automatically created by Drizzle based on schema definitions. Additional custom indexes:

```sql
-- Index for appointment queries
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

-- Index for prescription status
CREATE INDEX idx_prescriptions_status ON prescriptions(status);

-- Index for medicine stock
CREATE INDEX idx_medicines_stock ON medicines(stock_quantity);
```

### Query Optimization

```sql
-- Explain query plan
EXPLAIN ANALYZE 
SELECT * FROM appointments 
WHERE patient_id = 'uuid' 
AND status = 'pending';
```

## Security Best Practices

1. **Use environment variables** for credentials
2. **Never commit** `.env` file to version control
3. **Use parameterized queries** (Drizzle handles this)
4. **Regular backups** - automate daily backups
5. **Monitor logs** - check PostgreSQL logs regularly
6. **Update regularly** - keep PostgreSQL updated

## Connection Pooling

The application uses connection pooling via Neon serverless driver:

```typescript
// Configured in server/db.ts
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});
```

For high-traffic scenarios, adjust pool settings:

```typescript
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20,  // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## Troubleshooting

### Connection Refused

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list  # macOS

# Check port
netstat -an | grep 5432
```

### Permission Denied

```sql
-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE medivault TO medivault_user;
GRANT ALL ON SCHEMA public TO medivault_user;
```

### Schema Out of Sync

```bash
# Re-push schema
npm run db:push
```

### Migration Conflicts

```bash
# Check current schema
psql -U medivault_user medivault
\d

# Compare with shared/schema.ts
# Manually resolve conflicts if needed
```

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/15/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Neon Serverless Driver](https://github.com/neondatabase/serverless)
- Schema file: `shared/schema.ts`
- Database connection: `server/db.ts`
- Storage operations: `server/storage.ts`
