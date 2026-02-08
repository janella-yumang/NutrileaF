from app import create_app
from app.models import db, ProductCategory

app = create_app()

def seed_categories():
    """Seed product categories."""
    with app.app_context():
        # Check if categories already exist
        existing_count = ProductCategory.query.count()
        if existing_count > 0:
            print(f"ℹ️  Database already has {existing_count} categories. Skipping seed.")
            return

        categories_data = [
            {
                'name': 'Fresh Leaves',
                'description': 'Fresh organic moringa leaves harvested daily',
                'status': 'active'
            },
            {
                'name': 'Powder',
                'description': 'Finely ground moringa leaf powder',
                'status': 'active'
            },
            {
                'name': 'Tea',
                'description': 'Moringa tea blends and infusions',
                'status': 'active'
            },
            {
                'name': 'Supplements',
                'description': 'Moringa capsules and dietary supplements',
                'status': 'active'
            },
            {
                'name': 'Oils',
                'description': 'Cold-pressed moringa seed oils',
                'status': 'active'
            },
            {
                'name': 'Specialty',
                'description': 'Unique moringa products and blends',
                'status': 'active'
            },
            {
                'name': 'Mixes',
                'description': 'Ready-to-blend moringa mixes',
                'status': 'active'
            }
        ]

        for cat_data in categories_data:
            category = ProductCategory(**cat_data)
            db.session.add(category)

        db.session.commit()
        print(f"✓ {len(categories_data)} categories seeded successfully!")
        print("\nCategories added:")
        for cat in categories_data:
            print(f"  - {cat['name']}")

if __name__ == '__main__':
    seed_categories()
