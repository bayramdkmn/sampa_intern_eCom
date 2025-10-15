from django.contrib import admin
from.models import User,Address,PaymentCard,UserProfile,Message,Favorite,Notification

class UserAdmin(admin.ModelAdmin):
    list_display = ('first_name','last_name','email')

class AddressAdmin(admin.ModelAdmin):
    list_display = ('user','address_line','title','city','country','created_at')

class PaymentAdmin(admin.ModelAdmin):
    list_display = ('user','card_number','card_holder_name','expiry_month','expiry_year','created_at')

class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user','phone_number','birth_date','gender','created_at')

class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender','receiver','subject','content','is_read','created_at')

class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user','product','created_at')

class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user','title','message','is_read','created_at')

admin.site.register(User,UserAdmin)
admin.site.register(Address,AddressAdmin)
admin.site.register(PaymentCard,PaymentAdmin)
admin.site.register(UserProfile,UserProfileAdmin)
admin.site.register(Message,MessageAdmin)
admin.site.register(Favorite,FavoriteAdmin)
