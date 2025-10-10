from django.contrib import admin
from .models import Product,Categories,Variations,Brands,ProductRating

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'seo_title', 'seo_description', 'slug', 'isActive')
    search_fields = ('name', 'seo_title', 'seo_description', 'slug')
    list_filter = ('isActive', 'name')

class VariationAdmin(admin.ModelAdmin):
    list_display = ('product', 'name', 'price', 'discount_price')
    search_fields = ('product', 'name')
    list_filter = ('product',)

class InlineVariation(admin.TabularInline):
    model = Variations
    extra = 1

class ProductsAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'price', 'stock', 'created_at','discount_price', 'slug', 'isActive')
    search_fields = ('name', 'category', 'brand')
    list_filter = ('isActive', 'category', 'brand')
    inlines = [InlineVariation]

class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'seo_title', 'seo_description', 'slug')
    search_fields = ('name', 'seo_title', 'seo_description', 'slug')
    list_filter = ('name',)


admin.site.register(Product, ProductsAdmin)
admin.site.register(Categories, CategoryAdmin)
admin.site.register(Variations, VariationAdmin)
admin.site.register(Brands, BrandAdmin)
admin.site.register(ProductRating)