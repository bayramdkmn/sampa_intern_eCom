from django.urls import path
from .views import UserOrdersView, AllOrdersView, CreateOrderView, UncompletedOrdersView, CompleteOrderView, CancelOrderView

urlpatterns = [
    path('my-orders/', UserOrdersView.as_view(), name='my-orders'),
    path('all-orders/', AllOrdersView.as_view(), name='all-orders'),
    path('create/', CreateOrderView.as_view(), name='order-create'),
    path('<int:pk>/complete/', CompleteOrderView.as_view(), name='complete-order'),
    path('<int:pk>/cancel/', CancelOrderView.as_view(), name='cancel-order'),
    path('uncompleted/', UncompletedOrdersView.as_view(), name='uncompleted-orders'),
]
