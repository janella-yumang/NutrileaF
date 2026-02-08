from app import create_app
from app.models import db, Product

app = create_app()

with app.app_context():
    products = Product.query.all()
    print(f'Total products: {len(products)}')
    for p in products:
        print(f'ID: {p.id}, Name: {p.name}, Category: {p.category}, Price: {p.price}')
        print(f'  Image: {p.image}')
        print(f'  Description: {p.description[:100] if p.description else "None"}...')
        print('---')
