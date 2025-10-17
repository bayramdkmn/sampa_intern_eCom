from rest_framework import serializers
from .models import Cart, CartItem
from decimal import Decimal

class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_name', 'product_price', 'quantity', 'total_price']
        extra_kwargs = {
            'product': {'write_only': True}
        }

    def get_product_price(self, obj):
        # Ensure Decimal is returned for consistent math/serialization
        return Decimal(str(obj.product.price or 0))

    def get_total_price(self, obj):
        price = Decimal(str(obj.product.price or 0))
        quantity = int(obj.quantity)
        return price * quantity


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=False)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_price']
        read_only_fields = ['user']

    def get_total_price(self, obj):
        # Sum total price from related items to avoid trusting client input
        total = Decimal('0.00')
        for item in obj.items.select_related('product').all():
            price = Decimal(str(getattr(item.product, 'price', Decimal('0.00')) or Decimal('0.00')))
            quantity = int(item.quantity)
            total += price * quantity
        return total
