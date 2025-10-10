from rest_framework import generics, permissions,status
from .models import Order,OrderItem
from .serializers import OrderListSerializer
from django.shortcuts import get_object_or_404
from .serializers import OrderSerializer
from cart.models import CartItem
from rest_framework.response import Response
from decimal import Decimal, ROUND_HALF_UP
from django.db import transaction

class UserOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

class AllOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]

    queryset = Order.objects.all().order_by('-created_at')

class OrderCreateView(generics.CreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

class UncompletedOrdersView(generics.ListAPIView):
    serializer_class = OrderListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user, status='pending')

class CreateOrderView(generics.CreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        if not user or not user.is_authenticated:
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        # CartItem is linked to Cart, not directly to User. Query via cart__user
        cart_items = CartItem.objects.filter(cart__user=user).select_related('product', 'cart')
        if not cart_items.exists():
            return Response({"error": "Sepetiniz boş!"}, status=status.HTTP_400_BAD_REQUEST)

        # total_price güvenli şekilde Decimal ile hesaplanıyor
        total_price = Decimal('0.00')
        for item in cart_items:
            price = Decimal(str(item.product.price or 0))
            quantity = int(item.quantity)
            total_price += price * quantity

        total_price = total_price.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        # Create order + items atomically
        with transaction.atomic():
            order = Order.objects.create(
                user=user,
                total_price=total_price,
                status='pending'
            )

            # OrderItem oluştur (fiyat snapshot olarak kaydediliyor)
            for item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=int(item.quantity),
                    price=Decimal(str(item.product.price or 0))
                )

            # Sepeti temizle (delete only items for this user's cart)
            CartItem.objects.filter(cart__user=user).delete()

        # Response
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)



class CompleteOrderView(generics.UpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        # only owner or staff can complete
        if order.user != request.user and not request.user.is_staff:
            return Response({"detail": "You do not have permission to complete this order."}, status=status.HTTP_403_FORBIDDEN)

        # don't complete a cancelled order
        if order.status == 'cancelled':
            return Response({"detail": "Cancelled orders cannot be completed."}, status=status.HTTP_400_BAD_REQUEST)

        order.status = 'completed'
        order.save()
        return Response({"message": "Ödeme başarılı, sipariş tamamlandı!"})

class CancelOrderView(generics.UpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        # only owner or staff can cancel
        if order.user != request.user and not request.user.is_staff:
            return Response({"detail": "You do not have permission to cancel this order."}, status=status.HTTP_403_FORBIDDEN)

        # don't allow cancelling completed orders
        if order.status == 'completed':
            return Response({"detail": "Completed orders cannot be canceled."}, status=status.HTTP_400_BAD_REQUEST)

        order.status = 'cancelled'
        order.save()
        return Response({"message": "Sipariş iptal edildi!"})
