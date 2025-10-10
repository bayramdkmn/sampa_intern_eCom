from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import serializers
from .models import Address, PaymentCard, Favorite, Message, Notification, PasswordResetCode, UserProfile
from products.models import Product
import re
import random
import string
from rest_framework import exceptions
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name')
        extra_kwargs = {
            'username': {'required': False, 'allow_blank': True},
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
            'email': {'required': True},
        }

    @staticmethod
    def _sanitize_username(candidate: str) -> str:
        # Keep alphanumerics and underscore; replace others with underscore
        sanitized = re.sub(r'[^a-zA-Z0-9_]+', '_', candidate).strip('_')
        return sanitized or 'user'

    @staticmethod
    def _generate_random_suffix(length: int = 6) -> str:
        return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

    def _generate_unique_username(self, base: str) -> str:
        base = self._sanitize_username(base).lower()
        # Ensure not empty
        if not base:
            base = 'user'
        username = base
        counter = 0
        while User.objects.filter(username=username).exists():
            counter += 1
            # Try base + number up to some attempts, then add random suffix
            if counter < 50:
                username = f"{base}{counter}"
            else:
                username = f"{base}_{self._generate_random_suffix()}"
        return username

    def create(self, validated_data):
        provided_username = (validated_data.get('username') or '').strip()
        email = (validated_data.get('email') or '').strip()
        first_name = (validated_data.get('first_name') or '').strip()
        last_name = (validated_data.get('last_name') or '').strip()

        if provided_username:
            username = self._generate_unique_username(provided_username)
        elif email:
            # Use local-part of email as base
            local_part = email.split('@', 1)[0]
            username = self._generate_unique_username(local_part)
        else:
            # Fall back to generic user prefix
            username = self._generate_unique_username('user')

        extra_fields = {}
        if first_name:
            extra_fields['first_name'] = first_name
        if last_name:
            extra_fields['last_name'] = last_name

        user = User.objects.create_user(
            username=username,
            email=email or None,
            password=validated_data['password'],
            **extra_fields
        )
        return user

    def validate_email(self, value):
        email = (value or '').strip()
        if not email:
            raise serializers.ValidationError('E-posta gereklidir')
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError('Bu e-posta ile zaten bir hesap var')
        return email

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

    def create(self, validated_data):
        is_primary = validated_data.get('is_primary', False)
        address = super().create(validated_data)
        if is_primary:
            Address.objects.filter(user=address.user).exclude(pk=address.pk).update(is_primary=False)
        return address

    def update(self, instance, validated_data):
        is_primary = validated_data.get('is_primary', instance.is_primary)
        address = super().update(instance, validated_data)
        if is_primary:
            Address.objects.filter(user=address.user).exclude(pk=address.pk).update(is_primary=False)
        return address

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


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    # Accept email instead of username
    email = serializers.EmailField()
    password = serializers.CharField()
    # Make inherited username field optional to avoid required error
    username = serializers.CharField(required=False, allow_blank=True, write_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove username entirely so it's not shown as required anywhere
        if 'username' in self.fields:
            self.fields.pop('username')

    @classmethod
    def get_token(cls, user):
        return super().get_token(user)

    def validate(self, attrs):
        email = (attrs.get('email') or '').strip()
        password = attrs.get('password')
        if not email or not password:
            raise exceptions.AuthenticationFailed('E-posta ve şifre zorunludur')

        # Support non-unique emails by picking the user whose password matches
        candidates = User.objects.filter(email__iexact=email, is_active=True).order_by('-last_login', '-date_joined')
        user = None
        for u in candidates:
            if u.check_password(password):
                user = u
                break
        if user is None:
            raise exceptions.AuthenticationFailed('Geçersiz e-posta veya şifre')

        # Bridge to parent by providing username of the matched user
        data = super().validate({'username': user.get_username(), 'password': password})

        # Optionally include basic user info
        data['user'] = {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }
        return data


class UserUpdateSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'phone_number')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['phone_number'] = getattr(instance.profile, 'phone_number', '')
        return data

    def update(self, instance, validated_data):
        phone_number = validated_data.pop('phone_number', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save(update_fields=['first_name', 'last_name'])
        if phone_number is not None:
            profile, _ = UserProfile.objects.get_or_create(user=instance)
            profile.phone_number = phone_number
            profile.save(update_fields=['phone_number'])
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(min_length=8)
    new_password = serializers.CharField(min_length=8)
    new_password_confirm = serializers.CharField(min_length=8)

    def validate(self, attrs):
        user = self.context['request'].user
        old_password = attrs.get('old_password')
        new_password = attrs.get('new_password')
        new_password_confirm = attrs.get('new_password_confirm')

        if not user.check_password(old_password):
            raise serializers.ValidationError({'old_password': 'Eski şifre hatalı'})
        if new_password != new_password_confirm:
            raise serializers.ValidationError({'new_password_confirm': 'Şifreler eşleşmiyor'})
        if old_password == new_password:
            raise serializers.ValidationError({'new_password': 'Yeni şifre eski şifreyle aynı olamaz'})
        return attrs
