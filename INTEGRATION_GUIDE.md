# Integration Guide: PostgreSQL + E-commerce Orders

## What's Been Set Up

I've created a complete PostgreSQL integration for your e-commerce checkout flow:

### Backend (Python/Flask)
- **`app/models.py`** — SQLAlchemy models for Product, Order, User
- **`app/routes/orders.py`** — REST API endpoints to create/list/update orders
- **`app/__init__.py`** — Updated to initialize Flask-SQLAlchemy
- **`models_setup.py`** — CLI tool to initialize database schema

### Frontend (React)
- **`CheckoutScreen.tsx`** — Updated to POST orders to `/api/orders/create`
- **`CartScreen.tsx`** — Reads cart from localStorage
- Cart persists to localStorage on all mutations

---

## Quick Start (5 Minutes)

### 1. Get Your Render PostgreSQL Connection String

- Go to [render.com dashboard](https://dashboard.render.com)
- Find your PostgreSQL service
- Copy the **External Database URL** (looks like: `postgresql://user:password@hostname:5432/dbname`)

### 2. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Includes: `Flask-SQLAlchemy==3.0.5` and `psycopg2-binary`

### 3. Initialize Your Database

```bash
# macOS/Linux
export DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@YOUR_HOST:5432/YOUR_DB"

# Windows PowerShell
$env:DATABASE_URL = "postgresql://YOUR_USER:YOUR_PASSWORD@YOUR_HOST:5432/YOUR_DB"

# Run setup
python models_setup.py
```

Output:
```
Connecting to: postgresql://...
✓ Database tables created successfully!

Tables created:
  - products
  - orders
  - users
```

### 4. Configure Frontend (Optional)

If your backend is on Render (not localhost), set in `.env`:

```env
REACT_APP_API_URL=https://your-backend.onrender.com
```

(CheckoutScreen falls back to `http://localhost:5000` if not set)

### 5. Test Locally

```bash
# Terminal 1: Backend
cd backend
python server.py   # Runs on http://localhost:5000

# Terminal 2: Frontend
cd frontend
npm start          # Runs on http://localhost:3002
```

Go to http://localhost:3002 → Market → Add items → Checkout → Place Order

Check your PostgreSQL database:
```sql
SELECT * FROM orders;
```

---

## API Endpoints

### POST `/api/orders/create`
Create a new order (called from CheckoutScreen)

```javascript
fetch('http://localhost:5000/api/orders/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        userName: "John Doe",
        userPhone: "+63912345678",
        deliveryAddress: "123 Manila St",
        paymentMethod: "cod",  // cod, gcash, or card
        totalAmount: 948.00,
        items: [
            { id: 1, name: "Moringa Powder", price: 599, cartQuantity: 1 },
            { id: 7, name: "Smoothie Mix", price: 549, cartQuantity: 1 }
        ]
    })
})
.then(r => r.json())
.then(data => console.log(`Order created: #${data.orderId}`))
```

Response:
```json
{
    "success": true,
    "orderId": 1,
    "order": {
        "id": 1,
        "userName": "John Doe",
        "userPhone": "+63912345678",
        "deliveryAddress": "123 Manila St",
        "paymentMethod": "cod",
        "totalAmount": 948.00,
        "status": "pending",
        "createdAt": "2026-02-07T10:30:00"
    }
}
```

### GET `/api/orders/list`
View all orders

```bash
curl http://localhost:5000/api/orders/list
```

### GET `/api/orders/{orderId}`
View a specific order

```bash
curl http://localhost:5000/api/orders/1
```

### PUT `/api/orders/{orderId}/status`
Update order status

```bash
curl -X PUT http://localhost:5000/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

---

## Database Queries

Once data is in PostgreSQL, use psql or pgAdmin to query:

```sql
-- View recent orders
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

-- Total revenue
SELECT SUM(total_amount) as revenue FROM orders WHERE status = 'delivered';

-- Orders by payment method
SELECT payment_method, COUNT(*) as count, SUM(total_amount) as total
FROM orders
GROUP BY payment_method;

-- Most popular items
SELECT items -> 0 ->> 'name' as product, COUNT(*) as sold
FROM orders, jsonb_array_elements(items) as item
GROUP BY items -> 0 ->> 'name'
ORDER BY sold DESC;
```

---

## Deploy to Render

1. Push code to GitHub (with new `app/models.py`, `app/routes/orders.py`)
2. On Render, ensure environment variable is set:
   ```
   DATABASE_URL = postgresql://...
   ```
3. Add build command to initialize DB (if Render supports it) or run `models_setup.py` manually via Render's bash shell

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError: No module named 'sqlalchemy'` | Run `pip install -r requirements.txt` |
| `psycopg2 failed to load` | `pip install psycopg2-binary` |
| `ERROR: database "dbname" does not exist` | Run `python models_setup.py` to initialize |
| "CORS error on POST to /api/orders/create" | Frontend and backend origins are whitelist in Flask—check CORS_ORIGINS env var |
| "Order not saving" | Check DATABASE_URL is set and postgresql is running |

---

## Next Steps

1. ✅ Run `models_setup.py` to create tables
2. ✅ Test checkout flow locally
3. ⏭️ Deploy backend to Render with DATABASE_URL set
4. ⏭️ Seed products table (bulk insert moringa products)
5. ⏭️ Add admin dashboard to view/manage orders
6. ⏭️ Integrate payment gateway (Stripe, GCash API)

---

**Questions?** Refer to [POSTGRES_SETUP.md](./POSTGRES_SETUP.md) for detailed connection steps.
