from django.urls import path
from .views import CartViewSet

urlpatterns = [
    path('', CartViewSet.as_view({'get': 'list'}), name='cart-list'),
    path('add/', CartViewSet.as_view({'post': 'add'}), name='cart-add'),
    path('remove/', CartViewSet.as_view({'delete': 'remove'}), name='cart-remove'),
    path('decrease/', CartViewSet.as_view({'patch': 'decrease'}), name='cart-decrease'),
    path('clear/', CartViewSet.as_view({'delete': 'clear'}), name='cart-clear'),
]

