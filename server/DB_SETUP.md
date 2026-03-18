# MySQL Setup (Workbench Compatible)

## 1. Import Schema in MySQL Workbench
1. Open MySQL Workbench and connect to your MySQL server.
2. Go to `File > Open SQL Script...`.
3. Select: `server/sql/retreat_platform_db.sql`.
4. Click the lightning icon (`Execute`) to run the script.
5. Refresh `SCHEMAS` and verify `retreat_platform_db` is created.

## 2. Configure Backend Environment
Create `server/.env` from `server/.env.example` and set:

```env
PORT=5000
JWT_SECRET=change_this_secret
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=retreat_platform_db
DB_CONNECTION_LIMIT=10
```

## 3. Install Dependencies
From `server/`:

```bash
npm install
```

Quick credential test (recommended before running the API):

```bash
npm run db:check
```

If this fails with `Access denied`, create a dedicated application user in Workbench and use it in `server/.env`:

```sql
CREATE DATABASE IF NOT EXISTS retreat_platform_db;
CREATE USER IF NOT EXISTS 'retreat_app'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON retreat_platform_db.* TO 'retreat_app'@'localhost';
FLUSH PRIVILEGES;
```

Then set:

```env
DB_USER=retreat_app
DB_PASSWORD=StrongPassword123!
DB_NAME=retreat_platform_db
```

## 4. Start Server

```bash
npm run dev
```

If DB config is correct, startup logs include `Database connection established`.

## 5. Example SQL Test Queries

```sql
USE retreat_platform_db;

SELECT COUNT(*) AS total_users FROM users;
SELECT * FROM users ORDER BY created_at DESC;

SELECT s.id, s.service_type, t.title
FROM services s
JOIN tours t ON t.id = s.id
ORDER BY s.id DESC;

SELECT b.id, u.full_name, b.service_type, b.service_id, b.status, b.booking_date
FROM bookings b
JOIN users u ON u.id = b.user_id
ORDER BY b.created_at DESC;
```

## 6. Example API Test Calls

```bash
# Public read
curl http://localhost:5000/api/tours

# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"pass1234\",\"contactNumber\":\"+1-555-123-4567\"}"
```
