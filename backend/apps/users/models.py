from django.contrib.auth.models import AbstractUser
from django.db import models


class UserRole(models.TextChoices):
    USER = "USER", "Usuario"
    ADMIN = "ADMIN", "Administrador"


class User(AbstractUser):
    role = models.CharField(max_length=10, choices=UserRole.choices, default=UserRole.USER)
    phone = models.CharField(max_length=25, blank=True)

    class Meta:
        db_table = "users"

    def __str__(self) -> str:
        return f"{self.username} ({self.role})"
