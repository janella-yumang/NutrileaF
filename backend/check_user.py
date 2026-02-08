import os
from sqlalchemy import create_engine, text

DATABASE_URL = os.environ.get('DATABASE_URL', 
    'postgresql://nutrileaf_user:D4rXxZMUhfX2eC2nRbSeKxUTaG1bzTzg@dpg-d5uvupchg0os73a3ekdg-a.virginia-postgres.render.com/nutrileaf'
)

try:
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Check for user named 'may' (case insensitive)
        result = conn.execute(text("SELECT * FROM users WHERE LOWER(name) LIKE LOWER('%may%') OR LOWER(email) LIKE LOWER('%may%')"))
        users = result.fetchall()
        
        if users:
            print("🎯 Found user(s) with 'may' in name or email:")
            for user in users:
                print(f"  ID: {user.id}, Name: {user.name}, Email: {user.email}, Role: {user.role}")
                print(f"  Password hash: {user.password_hash[:50]}...")
        else:
            print("❌ No user named 'may' found")
        
        # Show all users
        print("\n📋 All users in database:")
        result = conn.execute(text("SELECT id, name, email, role FROM users ORDER BY id"))
        all_users = result.fetchall()
        
        for user in all_users:
            print(f"  {user.id}. {user.name} ({user.email}) - {user.role}")

        # Test admin user creation
        print("\n🔧 Testing admin user creation...")
        from werkzeug.security import generate_password_hash
        
        admin_password = "admin123"
        admin_hash = generate_password_hash(admin_password)
        print(f"Admin password hash: {admin_hash[:50]}...")

except Exception as e:
    print(f"❌ Error: {e}")
