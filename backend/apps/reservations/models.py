from datetime import datetime
from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q

from apps.courts.models import Court


class ReservationStatus(models.TextChoices):
    PENDING = "PENDING", "Pendiente"
    CONFIRMED = "CONFIRMED", "Confirmada"
    CANCELED = "CANCELED", "Cancelada"
    FINISHED = "FINISHED", "Finalizada"


class Reservation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reservations")
    court = models.ForeignKey(Court, on_delete=models.CASCADE, related_name="reservations")
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=ReservationStatus.choices, default=ReservationStatus.PENDING)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "reservations"
        ordering = ["-date", "-start_time"]

    def __str__(self) -> str:
        return f"{self.court.name} | {self.date} {self.start_time}-{self.end_time}"

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError("La hora inicial debe ser menor a la hora final")

        if self.status == ReservationStatus.CANCELED:
            return

        overlaps = Reservation.objects.filter(
            court=self.court,
            date=self.date,
        ).exclude(status=ReservationStatus.CANCELED)

        if self.pk:
            overlaps = overlaps.exclude(pk=self.pk)

        overlaps = overlaps.filter(
            Q(start_time__lt=self.end_time) & Q(end_time__gt=self.start_time)
        )

        if overlaps.exists():
            raise ValidationError("Conflicto de horario: ya existe una reserva en ese rango")

    def save(self, *args, **kwargs):
        start_dt = datetime.combine(self.date, self.start_time)
        end_dt = datetime.combine(self.date, self.end_time)
        hours = Decimal((end_dt - start_dt).seconds) / Decimal("3600")
        self.total_price = self.court.price_per_hour * hours
        self.full_clean()
        super().save(*args, **kwargs)
