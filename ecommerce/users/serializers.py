from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import serializers
from .models import Address, PaymentCard, Favorite, Message, Notification, PasswordResetCode
from products.models import Product

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password']
        )
        return user

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

class PaymentCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentCard
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

class FavoriteSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    class Meta:
        model = Favorite
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField(read_only=True)
    receiver = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ('sender', 'created_at')

class NotificationSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('user', 'created_at')


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError('Bu e-posta ile kayıtlı kullanıcı bulunamadı')
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(min_length=8)

    def validate(self, attrs):
        email = attrs.get('email')
        code = attrs.get('code')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({'email': 'Kullanıcı bulunamadı'})
        try:
            prc = PasswordResetCode.objects.filter(user=user, used=False).latest('created_at')
        except PasswordResetCode.DoesNotExist:
            raise serializers.ValidationError({'code': 'Geçerli bir kod bulunamadı'})
        if prc.code != code:
            raise serializers.ValidationError({'code': 'Kod hatalı'})
        if prc.expires_at < timezone.now():
            raise serializers.ValidationError({'code': 'Kodun süresi dolmuş'})
        attrs['user'] = user
        attrs['reset_obj'] = prc
        return attrs
