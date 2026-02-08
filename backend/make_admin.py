import os
from sqlalchemy import create_engine, text

DATABASE_URL = os.environ.get('DATABASE_URL', 
    'postgresql://nutrileaf_user:D4rXxZMUhfX2eC2nRbSeKxUTaG1bzTzg@dpg-d5uvupchg0os73a3ekdg-a.virginia-postgres.render.com/nutrileaf'
)

try:
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Update may's role to admin
        result = conn.execute(text("UPDATE users SET role = 'admin' WHERE name = 'may' OR email = 'may@gmail.com'"))
        conn.commit()
        
        if result.rowcount > 0:
            print("✅ Successfully updated may's role to admin!")
            
            # Verify the update
            verify_result = conn.execute(text("SELECT id, name, email, role FROM users WHERE name = 'may' OR email = 'may@gmail.com'"))
            user = verify_result.fetchone()
            
            if user:
                print(f"📋 Updated user details:")
                print(f"  ID: {user.id}")
                print(f"  Name: {user.name}")
                print(f"  Email: {user.email}")
                print(f"  Role: {user.role}")
            else:
                print("❌ Could not verify the update")
        else:
            print("❌ No user named 'may' found to update")

except Exception as e:
    print(f"❌ Error: {e}")
