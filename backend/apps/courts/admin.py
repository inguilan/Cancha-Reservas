from django.contrib import admin

from .models import Court


@admin.register(Court)
class CourtAdmin(admin.ModelAdmin):
    list_display = ("name", "court_type", "status", "price_per_hour", "location")
    list_filter = ("court_type", "status")
    search_fields = ("name", "location")
