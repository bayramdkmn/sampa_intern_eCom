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

        # Frontend'den gelen veriyi kullan
        data = request.data
        items = data.get('items', [])
        
        if not items:
            return Response({"error": "Sipariş ürünleri bulunamadı!"}, status=status.HTTP_400_BAD_REQUEST)

        address = user.addresses.filter(is_primary=True).first()
        if not address:
            return Response({"error": "Lütfen önce bir adres ekleyin veya primary adres belirleyin."}, status=status.HTTP_400_BAD_REQUEST)

        payment_card = user.cards.filter(is_primary=True).first()
        if not payment_card:
            return Response({"error": "Lütfen önce bir ödeme kartı ekleyin veya primary kart belirleyin."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # Frontend'den gelen total_amount'u kullan
                total_price = Decimal(str(data.get('total_amount', '0.00')))
                
                order = Order.objects.create(
                    user=user,
                    total_price=total_price,
                    address=address,
                    payment_card=payment_card,
                    status='pending'
                )

                # Frontend'den gelen items'ları kullan
                for item_data in items:
                    from products.models import Product
                    product = Product.objects.get(id=item_data['product_id'])
                    
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=item_data['quantity'],
                        price=Decimal(str(item_data['price']))
                    )

                # Sepeti temizle
                CartItem.objects.filter(cart__user=user).delete()

            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response(
                {"error": f"Sipariş oluşturulurken hata oluştu: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )




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
