# NutriLeaf Authentication System Implementation

## Overview
Complete user authentication system with registration, login, and JWT token-based session management.

## Backend (Python/Flask)

### Database
- SQLite database with `users` table containing:
  - id, full_name, email, phone, address, password_hash, created_at
  - Email is unique to prevent duplicate accounts

### Authentication Endpoints

#### `/api/auth/register` (POST)
**Request:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "09123456789",
  "address": "123 Main St",
  "password": "securepassword"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "09123456789",
    "address": "123 Main St"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### `/api/auth/login` (POST)
**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "09123456789",
    "address": "123 Main St"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### `/api/auth/verify` (GET)
**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "09123456789",
    "address": "123 Main St"
  }
}
```

### Security Features
- Passwords hashed using `werkzeug.security` (PBKDF2)
- JWT tokens with 30-day expiration
- Email validation and uniqueness check
- Password length validation (minimum 8 characters)

## Frontend (React/TypeScript)

### Storage
- User data stored in `localStorage.nutrileaf_user`
- JWT token stored in `localStorage.nutrileaf_token`

### Authentication Context (`AuthContext.tsx`)
Provides a global authentication state with hooks:
- `useAuth()` - Access auth state and methods
- Methods: `login()`, `register()`, `logout()`
- Properties: `user`, `token`, `isAuthenticated`, `isLoading`

### Updated Screens
- **LoginScreen.tsx** - Email/password login with form validation
- **RegisterScreen.tsx** - Full registration with user details
- Both automatically store tokens and redirect to home on success

### API Helper (`backend.ts`)
```typescript
export const login = async (credentials) => { ... }
export const register = async (userData) => { ... }
```

## Testing the Authentication Flow

### 1. Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "09123456789",
    "address": "123 Test St",
    "password": "testpassword123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

### 3. Verify Token
```bash
curl -X GET http://localhost:5000/api/auth/verify \
  -H "Authorization: Bearer <token_from_login>"
```

## Database Location
- Default: `backend/data/database.db`
- Can be configured via `DATABASE_URI` environment variable

## Environment Configuration
Set these environment variables as needed:
- `SECRET_KEY` - JWT signing key (defaults to 'supersecretkey')
- `DATABASE_URI` - SQLite connection string
- `REACT_APP_API_URL` - Backend API URL

## Next Steps
1. Add password reset functionality
2. Implement email verification
3. Add OAuth integration (Google, Facebook)
4. Implement refresh token rotation
5. Add two-factor authentication
