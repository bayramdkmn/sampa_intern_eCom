from rest_framework import serializers
from .models import Product, ProductRating

class ProductSerializer(serializers.ModelSerializer):
    rating_average = serializers.DecimalField(max_digits=3, decimal_places=2, read_only=True)
    rating_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = Product
        fields = '__all__'


class ProductRatingSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = ProductRating
        fields = ['id', 'product', 'user', 'user_username', 'stars', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']
