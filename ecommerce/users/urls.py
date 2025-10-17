from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import (
    RegisterView,
    AddressListCreateView, AddressDetailView,
    PaymentCardListCreateView, PaymentCardDetailView,
    FavoriteListCreateView, FavoriteDetailView,
    MessageListCreateView, MessageDetailView,
    NotificationListView, NotificationDetailView,
    PasswordResetRequestView, PasswordResetConfirmView,
    EmailTokenObtainPairView,
    MeUpdateView,
    PasswordChangeView
)
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('logout/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('addresses/', AddressListCreateView.as_view(), name='address-list-create'),
    path('addresses/<int:pk>/', AddressDetailView.as_view(), name='address-detail'),
    path('cards/', PaymentCardListCreateView.as_view(), name='card-list-create'),
    path('cards/<int:pk>/', PaymentCardDetailView.as_view(), name='card-detail'),
    path('favorites/', FavoriteListCreateView.as_view(), name='favorite-list-create'),
    path('favorites/<int:pk>/', FavoriteDetailView.as_view(), name='favorite-detail'),
    path('messages/', MessageListCreateView.as_view(), name='message-list-create'),
    path('messages/<int:pk>/', MessageDetailView.as_view(), name='message-detail'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/', NotificationDetailView.as_view(), name='notification-detail'),
    path('password-reset/request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('me/', MeUpdateView.as_view(), name='me-update'),
    path('password/change/', PasswordChangeView.as_view(), name='password-change'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
