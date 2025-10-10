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

    # POST /api/cart/add/
    @action(detail=False, methods=['post'])
    def add(self, request):
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Ürün bulunamadı'}, status=status.HTTP_404_NOT_FOUND)

        cart, _ = Cart.objects.get_or_create(user=request.user)

        item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            item.quantity += quantity
        item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

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

    # POST /api/cart/decrease_quantity/
    @action(detail=False, methods=['post'])
    def decrease_quantity(self, request):
        product_id = request.data.get('product_id')
        cart, _ = Cart.objects.get_or_create(user=request.user)
        try:
            item = CartItem.objects.get(cart=cart, product_id=product_id)
        except CartItem.DoesNotExist:
            return Response({'error': 'Ürün sepetinizde yok'}, status=status.HTTP_404_NOT_FOUND)
        if item.quantity > 1:
            item.quantity -= 1
            item.save()
        else:
            item.delete()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)
