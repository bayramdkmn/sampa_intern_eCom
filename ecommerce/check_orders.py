#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from orders.models import Order, OrderItem
from cart.models import Cart, CartItem

print("=" * 50)
print("SON 5 SİPARİŞ:")
print("=" * 50)

orders = Order.objects.all().order_by('-created_at')[:5]
for order in orders:
    print(f'\n📦 Order #{order.id} - {order.user.email}')
    print(f'   💰 Total: {order.total_price} TL')
    print(f'   📅 Created: {order.created_at}')
    print(f'   ✅ Status: {order.status}')
    print(f'   🛍️  Items:')
    for item in order.items.all():
        print(f'      - {item.product.name}: {item.quantity} adet x {item.price} TL = {item.quantity * item.price} TL')
    
    total_check = sum(item.quantity * item.price for item in order.items.all())
    if total_check != order.total_price:
        print(f'   ⚠️  UYARI: Toplam fiyat uyuşmuyor! Hesaplanan: {total_check}, Kaydedilen: {order.total_price}')

print("\n" + "=" * 50)
print("KULLANICILARIN SEPETLERİ:")
print("=" * 50)

carts = Cart.objects.all()
for cart in carts:
    items = CartItem.objects.filter(cart=cart)
    if items.exists():
        print(f'\n🛒 {cart.user.email} sepeti:')
        for item in items:
            print(f'   - {item.product.name}: {item.quantity} adet x {item.product.price} TL')
    else:
        print(f'\n🛒 {cart.user.email} sepeti: BOŞ')
