from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Min, Max
from django.db import models
from .models import Product, ProductRating, Categories, Brands
from .serializers import ProductSerializer, ProductRatingSerializer, CategorySerializer, BrandSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(isActive=True)
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'brand', 'isActive']
    search_fields = ['name', 'description', 'category__name', 'brand__name']
    ordering_fields = ['name', 'price', 'created_at', 'rating_average']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Product.objects.filter(isActive=True)
        
        # Arama
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search) |
                Q(category__name__icontains=search) |
                Q(brand__name__icontains=search)
            )
        
        # Kategori filtresi
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__id=category)
        
        # Marka filtresi
        brand = self.request.query_params.get('brand')
        if brand:
            queryset = queryset.filter(brand__id=brand)
        
        # Fiyat aralığı filtresi
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                pass
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                pass
        
        # Stok durumu filtresi
        in_stock = self.request.query_params.get('in_stock')
        if in_stock and in_stock.lower() == 'true':
            queryset = queryset.filter(stock__gt=0)
        
        # İndirimli ürünler
        on_sale = self.request.query_params.get('on_sale')
        if on_sale and on_sale.lower() == 'true':
            queryset = queryset.filter(discount_price__isnull=False)
        
        # Ana sayfa gösterimi
        main_window = self.request.query_params.get('main_window')
        if main_window and main_window.lower() == 'true':
            queryset = queryset.filter(main_window_display=True)
        
        return queryset

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def rate(self, request, pk=None):
        product = self.get_object()
        stars = request.data.get('stars')
        try:
            stars = int(stars)
        except (TypeError, ValueError):
            return Response({'detail': 'stars must be an integer between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)
        if stars < 1 or stars > 5:
            return Response({'detail': 'stars must be between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)

        rating, created = ProductRating.objects.update_or_create(
            product=product,
            user=request.user,
            defaults={'stars': stars}
        )
        serializer = ProductRatingSerializer(rating)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def ratings(self, request, pk=None):
        product = self.get_object()
        ratings = product.ratings.select_related('user').all().order_by('-updated_at')
        serializer = ProductRatingSerializer(ratings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def filter_options(self, request):
        """Filtreleme seçeneklerini döndürür"""
        categories = Categories.objects.filter(isActive=True).values('id', 'name')
        brands = Brands.objects.filter(isActive=True).values('id', 'name')
        
        # Fiyat aralığı
        price_range = Product.objects.filter(isActive=True).aggregate(
            min_price=models.Min('price'),
            max_price=models.Max('price')
        )
        
        return Response({
            'categories': list(categories),
            'brands': list(brands),
            'price_range': price_range
        })

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def featured(self, request):
        """Ana sayfa için öne çıkan ürünler"""
        queryset = self.get_queryset().filter(main_window_display=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def on_sale(self, request):
        """İndirimli ürünler"""
        queryset = self.get_queryset().filter(discount_price__isnull=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def top_rated(self, request):
        """En yüksek puanlı ürünler"""
        queryset = self.get_queryset().filter(rating_count__gt=0).order_by('-rating_average')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Categories.objects.filter(isActive=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def products(self, request, pk=None):
        """Kategoriye ait ürünleri döndürür"""
        category = self.get_object()
        products = Product.objects.filter(category=category, isActive=True)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)


class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Brands.objects.filter(isActive=True)
    serializer_class = BrandSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def products(self, request, pk=None):
        """Markaya ait ürünleri döndürür"""
        brand = self.get_object()
        products = Product.objects.filter(brand=brand, isActive=True)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
