from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User, UserRole


@admin.action(description="Marcar como encargado")
def make_admin(modeladmin, request, queryset):
    queryset.update(role=UserRole.ADMIN, is_staff=True)


@admin.action(description="Marcar como usuario normal")
def make_user(modeladmin, request, queryset):
    queryset.update(role=UserRole.USER)


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = DjangoUserAdmin.fieldsets + (("Extra", {"fields": ("role", "phone")}),)
    list_display = ("username", "email", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_active")
    search_fields = ("username", "email", "first_name", "last_name", "phone")
    actions = (make_admin, make_user)
