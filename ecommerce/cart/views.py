from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from .models import Cart, CartItem
from .serializers import CartSerializer
from products.models import Product

class CartViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    # GET /api/cart/
    def list(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add(self, request):
        product_id = request.data.get('product_id')
        try:
            quantity = int(request.data.get('quantity', 1))
            if quantity < 1:
                return Response({'error': 'Quantity >=1 olmalı'}, status=400)
        except (TypeError, ValueError):
            return Response({'error': 'Quantity geçersiz'}, status=400)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Ürün bulunamadı'}, status=404)

        cart, _ = Cart.objects.get_or_create(user=request.user)

        # Eğer zaten sepette varsa quantity artır
        item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            item.quantity += quantity
        else:
            item.quantity = quantity  # Yeni eklenen ürün miktarını ata
        item.save()

        serializer = CartSerializer(cart)  # Nested serializer otomatik toplamı alır
        return Response(serializer.data, status=200)

    # DELETE /api/cart/remove/
    @action(detail=False, methods=['delete'])
    def remove(self, request):
        product_id = request.data.get('product_id')
        cart, _ = Cart.objects.get_or_create(user=request.user)

        CartItem.objects.filter(cart=cart, product_id=product_id).delete()

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

    # DELETE /api/cart/remove_item/
    @action(detail=False, methods=['delete'])
    def remove_item(self, request):
        product_id = request.data.get('product_id')
        cart, _ = Cart.objects.get_or_create(user=request.user)
        CartItem.objects.filter(cart=cart, product_id=product_id).delete()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['patch'], url_path='update_quantity')
    def update_quantity(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'Product ID gerekli'}, status=400)

        try:
            quantity_to_change = int(request.data.get('quantity', 1))
            if quantity_to_change < 1:
                return Response({'error': 'Quantity >= 1 olmalı'}, status=400)
        except (TypeError, ValueError):
            return Response({'error': 'Quantity geçersiz'}, status=400)

        cart, _ = Cart.objects.get_or_create(user=request.user)

        try:
            # Sadece ilgili ürün seçiliyor
            item = CartItem.objects.get(cart=cart, product_id=product_id)
        except CartItem.DoesNotExist:
            return Response({'error': 'Ürün sepetinizde yok'}, status=404)

        if item.quantity > quantity_to_change:
            item.quantity -= quantity_to_change
            item.save()
        else:
            # Sadece bu item silinir
            item.delete()

        serializer = CartSerializer(cart)
        return Response(serializer.data)



