from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Product, ProductRating
from .serializers import ProductSerializer, ProductRatingSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Product.objects.all()
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
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
