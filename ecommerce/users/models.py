from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import random
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Q

# ---------------------------
# User Model
# ---------------------------
class User(AbstractUser):
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.email

# ---------------------------
# Address Model
# ---------------------------
class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    title = models.CharField(max_length=100)  # Ev, iş, vs.
    address_line = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    is_primary = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.email} - {self.title}"

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user'],
                condition=Q(is_primary=True),
                name='unique_primary_address_per_user'
            )
        ]

# ---------------------------
# PaymentCard Model
# ---------------------------
class PaymentCard(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cards')
    card_number = models.CharField(max_length=16)
    card_holder_name = models.CharField(max_length=100)
    expiry_month = models.IntegerField()
    expiry_year = models.IntegerField()
    cvv = models.CharField(max_length=4)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.card_holder_name}"

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user'],
                condition=Q(is_primary=True),
                name='unique_primary_card_per_user'
            )
        ]

# ---------------------------
# Favorite Model
# ---------------------------
class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user.email} - {self.product.name}"

# ---------------------------
# Message Model
# ---------------------------
class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    subject = models.CharField(max_length=200, null=True, blank=True)
    content = models.TextField(blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.email} -> {self.receiver.email}: {self.subject}"

# ---------------------------
# Notification Model
# ---------------------------
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200, blank=True, null=True)
    message = models.TextField(blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email}: {self.title}"

# ---------------------------
# PasswordResetCode Model
# ---------------------------
class PasswordResetCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_codes')
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    used = models.BooleanField(default=False)

    @classmethod
    def create_for_user(cls, user):
        # Eski kodları temizle
        cls.objects.filter(user=user, used=False).update(used=True)
        
        # Yeni kod oluştur
        code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        expires_at = timezone.now() + timezone.timedelta(minutes=10)
        
        return cls.objects.create(
            user=user,
            code=code,
            expires_at=expires_at
        )

    def __str__(self):
        return f"{self.user.email}: {self.code}"

# ---------------------------
# UserProfile Model
# ---------------------------
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=10, choices=[('M', 'Erkek'), ('F', 'Kadın'), ('O', 'Diğer')], blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} Profile"

# ---------------------------
# Signals
# ---------------------------
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()
