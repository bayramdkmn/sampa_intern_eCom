from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from products.models import Product
import random
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Q

# Create your models here.

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
        return f"{self.user.username} - {self.title}"

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user'],
                condition=Q(is_primary=True),
                name='unique_primary_address_per_user'
            )
        ]

class PaymentCard(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cards')
    card_holder = models.CharField(max_length=100)
    card_number = models.CharField(max_length=20)
    expiry_month = models.IntegerField()
    expiry_year = models.IntegerField()
    cvc = models.CharField(max_length=4)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.card_holder}"

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user.username} - {self.product.name}"

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username}: {self.content[:20]}"

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    content = models.CharField(max_length=255)
    notification_type = models.CharField(max_length=50)  # ör: 'order', 'message', 'system'
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.notification_type}: {self.content[:20]}"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} Profile"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance: User, created: bool, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

class PasswordResetCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_codes')
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'code', 'used']),
            models.Index(fields=['expires_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.code}"

    @staticmethod
    def generate_six_digit_code() -> str:
        return f"{random.randint(0, 999999):06d}"

    @classmethod
    def create_for_user(cls, user: User, ttl_minutes: int = 15) -> 'PasswordResetCode':
        now = timezone.now()
        expires = now + timezone.timedelta(minutes=ttl_minutes)
        code = cls.generate_six_digit_code()
        return cls.objects.create(user=user, code=code, expires_at=expires)
