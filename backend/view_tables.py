"""
View all tables and their contents in PostgreSQL.
"""

import os
from sqlalchemy import create_engine, inspect, text
from tabulate import tabulate

DATABASE_URL = os.environ.get('DATABASE_URL', 
    'postgresql://nutrileaf_user:D4rXxZMUhfX2eC2nRbSeKxUTaG1bzTzg@dpg-d5uvupchg0os73a3ekdg-a.virginia-postgres.render.com/nutrileaf'
)

try:
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print("\n" + "="*80)
        print(f"DATABASE: nutrileaf | TABLES: {len(tables)}")
        print("="*80 + "\n")
        
        for table_name in sorted(tables):
            # Get column info
            columns = inspector.get_columns(table_name)
            column_info = [(col['name'], str(col['type'])) for col in columns]
            
            # Get row count
            result = conn.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
            row_count = result.scalar()
            
            print(f"\n📋 TABLE: {table_name.upper()} ({row_count} rows)")
            print("-" * 80)
            print("Columns:")
            for col_name, col_type in column_info:
                print(f"  • {col_name:<30} {col_type}")
            
            # Show data if table has rows
            if row_count > 0:
                print(f"\nData Preview (first 5 rows):")
                query = f"SELECT * FROM {table_name} LIMIT 5"
                result = conn.execute(text(query))
                rows = result.fetchall()
                
                if rows:
                    headers = result.keys()
                    data = [list(row) for row in rows]
                    print(tabulate(data, headers=headers, tablefmt='grid'))
            else:
                print("ℹ️  Table is empty")
        
        print("\n" + "="*80)
        print("✅ Database inspection complete!")
        print("="*80 + "\n")

except Exception as e:
    print(f"❌ Error: {e}")
    print("\nMake sure:")
    print("  1. You have internet connection")
    print("  2. DATABASE_URL environment variable is set")
    print("  3. PostgreSQL credentials are correct")
