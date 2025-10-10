from django.urls import path
from .views import CartViewSet

urlpatterns = [
    path('', CartViewSet.as_view({'get': 'list'}), name='cart-list'),
    path('add/', CartViewSet.as_view({'post': 'add'}), name='cart-add'),
    path('remove/', CartViewSet.as_view({'post': 'remove'}), name='cart-remove'),
    path('remove_item/', CartViewSet.as_view({'delete': 'remove_item'}), name='cart-remove-item'),
    path('decrease_quantity/', CartViewSet.as_view({'post': 'decrease_quantity'}), name='cart-decrease-quantity'),
]
