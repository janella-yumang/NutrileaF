# Quick Start: Initialize Your Render PostgreSQL Database

Your database URL has been embedded in the setup scripts. Run these commands to initialize everything:

## One-Command Setup (Recommended)

```bash
cd backend
python setup_all.py
```

This will:
1. ✓ Test your PostgreSQL connection
2. ✓ Create `products`, `orders`, `users` tables
3. ✓ Seed 8 Moringa products
4. ✓ Show you the database info

**Expected output:**
```
NUTRILEA - PostgreSQL Setup
✓ Connection successful!
✓ Tables created: products, orders, users
✓ Seeded 8 products
✓ Setup Complete!
```

---

## Manual Steps (if needed)

### Step 1: Test Connection
```bash
cd backend
python test_connection.py
```

### Step 2: Create Tables
```bash
python models_setup.py
```

### Step 3: Seed Products
```bash
python seed_products.py
```

---

## Your Database Details

- **External URL:** postgresql://nutrileaf_user:D4rXxZMUhfX2eC2nRbSeKxUTaG1bzTzg@dpg-d5uvupchg0os73a3ekdg-a.virginia-postgres.render.com/nutrileaf
- **Host:** dpg-d5uvupchg0os73a3ekdg-a.virginia-postgres.render.com
- **Database:** nutrileaf
- **User:** nutrileaf_user
- **Tables:** products, orders, users

---

## Verify with psql (Optional)

```bash
psql "postgresql://nutrileaf_user:D4rXxZMUhfX2eC2nRbSeKxUTaG1bzTzg@dpg-d5uvupchg0os73a3ekdg-a.virginia-postgres.render.com/nutrileaf"
```

Then try these queries:
```sql
SELECT COUNT(*) FROM products;
\d products
SELECT * FROM products LIMIT 3;
```

---

## Next: Run Locally & Test

**Terminal 1 (Backend):**
```bash
cd backend
python server.py
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

Go to http://localhost:3002 → Market → Add items → Checkout

When you click "Place order", it will save to your Render PostgreSQL database!

---

## Verify Order Was Saved

In psql:
```sql
SELECT * FROM orders;
```

Or from Python (after checkout):
```python
from app.models import db, Order
orders = Order.query.all()
print(orders)
```

---

## FAQ

**Q: Can I use pgAdmin or DBeaver to browse the database?**  
A: Yes! Use your External URL above as the connection string.

**Q: How do I add more products?**  
A: Edit `seed_products.py` and run it again, or insert directly:
```sql
INSERT INTO products (name, price, category, ...) VALUES (...);
```

**Q: Is my password secure?**  
A: This URL is for development. On production (Render), use environment variables instead:
```bash
export DATABASE_URL="postgresql://..."
```

**Q: My backend is on Render, how do I set this?**  
A: In Render service environment variables, add:
```
DATABASE_URL = postgresql://nutrileaf_user:D4rXxZMUhfX2eC2nRbSeKxUTaG1bzTzg@dpg-d5uvupchg0os73a3ekdg-a.virginia-postgres.render.com/nutrileaf
```

---

**Ready? Run:** `python setup_all.py`
