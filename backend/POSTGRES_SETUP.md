# PostgreSQL on Render: Quick Access Guide

## 1. Find Your Connection Details

Go to [Render Dashboard](https://dashboard.render.com) → Your PostgreSQL Service → Info tab

Copy one of these:
- **Internal URL** (within Render): `postgresql://user:password@internal-hostname:5432/dbname`
- **External URL** (from your local machine): `postgresql://user:password@hostname:5432/dbname`

## 2. Access Via Command Line

```bash
# Install psql if needed (macOS with Homebrew)
brew install postgresql@15

# Connect to your database
psql "postgresql://USER:PASSWORD@HOST:5432/DBNAME"

# Common commands once connected:
\dt             # List all tables
\d products     # Describe products table
SELECT * FROM products;           # View all products
SELECT * FROM orders LIMIT 10;    # View first 10 orders
```

## 3. Access Via GUI (Recommended)

### Option A: pgAdmin (Free, Web-based)
1. Visit [pgadmin.io](https://pgadmin.io) or spin up Docker: `docker run -p 5050:80 dpage/pgadmin4`
2. Login and create a new server
3. Use your Render PostgreSQL credentials

### Option B: DBeaver (Free, Desktop)
1. Download from [dbeaver.io](https://dbeaver.io)
2. File → New Database Connection → PostgreSQL
3. Enter your Render credentials
4. Browse tables, run queries, import/export data

## 4. Initialize Database Locally

In your backend folder, set the DATABASE_URL and run:

```bash
# Linux/macOS
export DATABASE_URL="postgresql://user:password@host:5432/dbname"
python models_setup.py

# Windows PowerShell
$env:DATABASE_URL = "postgresql://user:password@host:5432/dbname"
python models_setup.py
```

This creates:
- `products` table
- `orders` table (for e-commerce checkout)
- `users` table

## 5. Wire Your Backend to PostgreSQL

Your Flask app now has models ready:

```python
# In backend routes:
from app.models import db, Order, Product

# Save an order
order = Order(
    user_name="John",
    user_phone="+63912345",
    delivery_address="123 St",
    payment_method="cod",
    total_amount=950.00,
    items=[...]
)
db.session.add(order)
db.session.commit()

# Query orders
orders = Order.query.all()
```

## 6. Sample Queries

```sql
-- View all products
SELECT * FROM products;

-- View recent orders
SELECT * FROM orders ORDER BY created_at DESC LIMIT 20;

-- Total sales
SELECT SUM(total_amount) FROM orders WHERE status = 'delivered';

-- Orders by payment method
SELECT payment_method, COUNT(*), SUM(total_amount) 
FROM orders 
GROUP BY payment_method;
```

## 7. Backup/Export Data

From psql:
```bash
# Export entire database
pg_dump --dbname=postgresql://user:password@host:5432/dbname > backup.sql

# Restore from backup
psql --dbname=postgresql://user:password@host:5432/dbname < backup.sql
```

## 8. Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection refused | Check host/port, ensure Render DB is running |
| "psycopg2 not installed" | `pip install psycopg2-binary` |
| "database does not exist" | Run `models_setup.py` or create manually in pgAdmin |
| External URL not working | Use Internal URL on Render; External URL for local/Vercel |

## 9. Environment Variables on Render

In your Render Web Service settings:

```
DATABASE_URL = postgresql://user:password@hostname:5432/dbname
```

Your Flask config automatically picks this up!

---

**Next Steps:**
1. Get your DATABASE_URL from Render
2. Run `python models_setup.py` locally to test connection & create tables
3. Register the `orders_bp` blueprint in `app/__init__.py`
4. Test the `/api/orders/create` endpoint from your frontend checkout
