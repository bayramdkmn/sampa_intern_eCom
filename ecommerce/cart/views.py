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
        """Sepetten belirli bir ürünü tamamen çıkarır."""
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'Product ID gerekli'}, status=400)
            
        cart, _ = Cart.objects.get_or_create(user=request.user)
        CartItem.objects.filter(cart=cart, product_id=product_id).delete()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

    # PATCH /api/cart/decrease/
    @action(detail=False, methods=['patch'])
    def decrease(self, request):
        """Sepetteki bir ürünün miktarını azaltır, miktar 0'a düşerse ürünü sepetten çıkarır."""
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'Product ID gerekli'}, status=400)

        try:
            quantity = int(request.data.get('quantity', 1))
            if quantity < 1:
                return Response({'error': 'Quantity >= 1 olmalı'}, status=400)
        except (TypeError, ValueError):
            return Response({'error': 'Quantity geçersiz'}, status=400)

        cart, _ = Cart.objects.get_or_create(user=request.user)

        try:
            item = CartItem.objects.get(cart=cart, product_id=product_id)
        except CartItem.DoesNotExist:
            return Response({'error': 'Ürün sepetinizde yok'}, status=404)

        if item.quantity > quantity:
            item.quantity -= quantity
            item.save()
        else:
            # Miktar 0 veya daha az olursa ürünü sepetten çıkar
            item.delete()

        serializer = CartSerializer(cart)
        return Response(serializer.data)

    # DELETE /api/cart/clear/
    @action(detail=False, methods=['delete'])
    def clear(self, request):
        """Sepeti tamamen temizler, tüm ürünleri kaldırır."""
        cart, _ = Cart.objects.get_or_create(user=request.user)
        CartItem.objects.filter(cart=cart).delete()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)



