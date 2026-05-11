from django.db import models


class CourtStatus(models.TextChoices):
    AVAILABLE = "AVAILABLE", "Disponible"
    MAINTENANCE = "MAINTENANCE", "En mantenimiento"
    OCCUPIED = "OCCUPIED", "Ocupada"


class CourtType(models.TextChoices):
    FOOTBALL = "FOOTBALL", "Futbol"
    BASKETBALL = "BASKETBALL", "Baloncesto"
    TENNIS = "TENNIS", "Tenis"
    PADEL = "PADEL", "Padel"
    VOLLEYBALL = "VOLLEYBALL", "Voleibol"
    OTHER = "OTHER", "Otra"


class Court(models.Model):
    name = models.CharField(max_length=120, unique=True)
    court_type = models.CharField(max_length=20, choices=CourtType.choices)
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2)
    location = models.CharField(max_length=255)
    image = models.ImageField(upload_to="courts/", null=True, blank=True)
    status = models.CharField(max_length=20, choices=CourtStatus.choices, default=CourtStatus.AVAILABLE)
    opening_time = models.TimeField()
    closing_time = models.TimeField()
    available_weekdays = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "courts"
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} - {self.get_court_type_display()}"
