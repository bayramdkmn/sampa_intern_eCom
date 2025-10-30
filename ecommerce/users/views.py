from rest_framework import generics, permissions, status
from rest_framework.permissions import AllowAny
from .models import User
from django.db import models
from django.utils import timezone
from .models import Address, PaymentCard, Favorite, Message, Notification, PasswordResetCode
from .serializers import (
    RegisterSerializer, AddressSerializer, PaymentCardSerializer, FavoriteSerializer,
    MessageSerializer, NotificationSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    EmailTokenObtainPairSerializer, ChangePasswordSerializer
)
from rest_framework.response import Response
import os
import requests
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import serializers

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

class AddressUpdateView(generics.UpdateAPIView):
    """
    PATCH /api/addresses/<int:pk>/  -> Adres güncelleme
    """
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Kullanıcı kendi adreslerini güncelleyebilir
        return Address.objects.filter(user=self.request.user)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)


class AddressDeleteView(generics.DestroyAPIView):
    """
    DELETE /api/addresses/<int:pk>/  -> Adres silme
    """
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Kullanıcı sadece kendi adresini silebilir
        return Address.objects.filter(user=self.request.user)

class PaymentCardListCreateView(generics.ListCreateAPIView):
    serializer_class = PaymentCardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PaymentCard.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PaymentCardDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PaymentCardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PaymentCard.objects.filter(user=self.request.user)

class FavoriteListCreateView(generics.ListCreateAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class FavoriteDetailView(generics.DestroyAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Kullanıcıya gelen ve kullanıcının gönderdiği mesajlar
        return Message.objects.filter(models.Q(sender=self.request.user) | models.Q(receiver=self.request.user)).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

class MessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(models.Q(sender=self.request.user) | models.Q(receiver=self.request.user))

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class PasswordResetRequestView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)

        reset_code = PasswordResetCode.create_for_user(user)

        # Send via Mailjet
        mailjet_api_key = os.getenv('MAILJET_API_KEY')
        mailjet_secret_key = os.getenv('MAILJET_SECRET_KEY')
        mailjet_from_email = os.getenv('MAILJET_FROM_EMAIL', 'no-reply@example.com')
        mailjet_from_name = os.getenv('MAILJET_FROM_NAME', 'Sampa E-comm')

        email_sent = False
        if mailjet_api_key and mailjet_secret_key and mailjet_api_key != 'dkmsakdsmkadkmsakmd':
            try:
                resp = requests.post(
                    'https://api.mailjet.com/v3.1/send',
                    auth=(mailjet_api_key, mailjet_secret_key),
                    json={
                        'Messages': [{
                            'From': {'Email': mailjet_from_email, 'Name': mailjet_from_name},
                            'To': [{'Email': email}],
                            'Subject': 'Şifre Sıfırlama Kodu',
                            'TextPart': f'Sifre sifirlama kodunuz: {reset_code.code}. Kod {reset_code.expires_at.strftime("%H:%M")} saatine kadar geçerlidir.'
                        }]
                    },
                    timeout=10
                )
                resp.raise_for_status()
                email_sent = True
            except Exception as e:
                print(f"❌ Email gönderilemedi: {str(e)}")
        
        # Development mode: print code to console
        if not email_sent:
            print(f"\n{'='*60}")
            print(f"🔑 ŞİFRE SIFIRLAMA KODU (DEVELOPMENT)")
            print(f"{'='*60}")
            print(f"Email: {email}")
            print(f"Kod: {reset_code.code}")
            print(f"Geçerlilik: {reset_code.expires_at.strftime('%H:%M')} saatine kadar")
            print(f"{'='*60}\n")
        
        # Return code in development mode
        response_data = {'detail': 'Kod gönderildi'}
        if os.getenv('DJANGO_DEBUG', 'False') == 'True' and not email_sent:
            response_data['code'] = reset_code.code  # Only in DEBUG mode!
        
        return Response(response_data, status=status.HTTP_200_OK)


class PasswordResetConfirmView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        reset_obj = serializer.validated_data['reset_obj']
        new_password = serializer.validated_data['new_password']

        user.set_password(new_password)
        user.save(update_fields=['password'])
        reset_obj.used = True
        reset_obj.save(update_fields=['used'])

        return Response({'detail': 'Şifre güncellendi'}, status=status.HTTP_200_OK)


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer
    permission_classes = [AllowAny]


class MeUpdateView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = None  # will set dynamically

    def get_serializer_class(self):
        from .serializers import UserUpdateSerializer
        return UserUpdateSerializer

    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PasswordChangeView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def put(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        new_password = serializer.validated_data['new_password']
        user.set_password(new_password)
        user.save(update_fields=['password'])
        return Response({'detail': 'Şifre güncellendi'}, status=status.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        return self.put(request, *args, **kwargs)
