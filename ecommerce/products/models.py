from django.db import models
from django.utils.text import slugify

# Create your models here.

class Categories(models.Model):
    name = models.CharField(max_length=155)

    mainCategory = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True,
                                     help_text="Eğer bu kategori başka bir kategoriye bağlıysa burayı doldurunuz")  # self kullanma nedenimiz bir kategori diğer kategorinin üst kategorisi olabilir.
    isActive = models.BooleanField(default=True)

    seo_title = models.CharField(max_length=155, blank=True, null=True)
    seo_description = models.TextField(blank=True, null=True)
    slug = models.SlugField(max_length=155, unique=True, null=True, blank=True)

    class Meta:
        verbose_name_plural = "Categories"
        verbose_name = "Category"

    def __str__(self):
        return self.name

class Brands(models.Model):
    name = models.CharField(max_length=155)
    description = models.TextField(blank=True, null=True)
    seo_title = models.CharField(max_length=155, blank=True, null=True)
    seo_description = models.TextField(blank=True, null=True)
    slug = models.SlugField(max_length=155, blank=True, null=True, unique=True)
    isActive = models.BooleanField(default=True)
    image = models.ImageField(upload_to='brands/', blank=True, null=True)

    class Meta:
        verbose_name_plural = 'Brands'
        verbose_name = 'Brand'

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    isActive = models.BooleanField(default=True)
    main_window_display = models.BooleanField(default=True)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    slug = models.SlugField(max_length=155, blank=True, null=True, unique=True)
    category = models.ForeignKey(Categories, on_delete=models.CASCADE,null=True,blank=True)
    brand = models.ForeignKey(Brands, on_delete=models.CASCADE,null=True,blank=True)
    rating_average = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    rating_count = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = 'Products'
        verbose_name = 'Product'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super(Product, self).save(*args, **kwargs)
        return self.slug


class Variations(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    parent_variant = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True)
    name = models.CharField(max_length=155)
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text='Parasal Karşılık')
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    stock = models.PositiveIntegerField(default=0)
    isActive = models.BooleanField(default=True)
    image = models.ImageField(upload_to='variations/', blank=True, null=True)

    class Meta:
        verbose_name_plural = 'Variations'
        verbose_name = 'Variation'

    def __str__(self):
        return f"{self.product.name} - {self.name}"


# User model will be imported as string reference
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Avg, Count
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

class ProductRating(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='product_ratings')
    stars = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('product', 'user')
        verbose_name_plural = 'Product Ratings'
        verbose_name = 'Product Rating'

    def __str__(self):
        return f"{self.product.name} - {self.user.email}: {self.stars}"


def _recalculate_product_rating(product: Product) -> None:
    agg = product.ratings.aggregate(avg=Avg('stars'), cnt=Count('id'))
    product.rating_average = round((agg['avg'] or 0), 2) if agg['avg'] is not None else 0
    product.rating_count = agg['cnt'] or 0
    product.save(update_fields=['rating_average', 'rating_count'])


@receiver(post_save, sender=ProductRating)
def update_product_rating_on_save(sender, instance: 'ProductRating', **kwargs):
    _recalculate_product_rating(instance.product)


@receiver(post_delete, sender=ProductRating)
def update_product_rating_on_delete(sender, instance: 'ProductRating', **kwargs):
    _recalculate_product_rating(instance.product)
