from rest_framework import serializers
from .models import Product, ProductRating, Brands, Categories

class ProductSerializer(serializers.ModelSerializer):
    rating_average = serializers.DecimalField(max_digits=3, decimal_places=2, read_only=True)
    rating_count = serializers.IntegerField(read_only=True)
    brand = serializers.SlugRelatedField(read_only=True, slug_field='name')
    category = serializers.SlugRelatedField(read_only=True, slug_field='name')
    brand_id = serializers.PrimaryKeyRelatedField(queryset=Brands.objects.all(), source='brand', write_only=True, required=False, allow_null=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=Categories.objects.all(), source='category', write_only=True, required=False, allow_null=True)

    class Meta:
        model = Product
        fields = [
            'id', 'rating_average', 'rating_count', 'name', 'description', 'price', 'stock',
            'created_at', 'image', 'isActive', 'main_window_display', 'discount_price', 'slug',
            'category', 'brand', 'category_id', 'brand_id'
        ]


class ProductRatingSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = ProductRating
        fields = ['id', 'product', 'user', 'user_username', 'stars', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']
