from django.contrib import admin

from .models import Reservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ("court", "user", "date", "start_time", "end_time", "status", "total_price")
    list_filter = ("status", "date")
    search_fields = ("court__name", "user__username")
