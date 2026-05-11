from datetime import datetime, time, timedelta

from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.reservations.models import Reservation, ReservationStatus
from apps.users.permissions import IsAdminUserRole

from .models import Court
from .serializers import CourtSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return IsAdminUserRole().has_permission(request, view)


class CourtViewSet(viewsets.ModelViewSet):
    queryset = Court.objects.all()
    serializer_class = CourtSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ["status", "court_type"]
    search_fields = ["name", "location", "court_type"]
    ordering_fields = ["name", "price_per_hour", "created_at"]

    @action(detail=True, methods=["get"], permission_classes=[permissions.AllowAny])
    def available_slots(self, request, pk=None):
        court = self.get_object()
        date_str = request.query_params.get("date")

        if not date_str:
            return Response({"error": "Parametro 'date' requerido (YYYY-MM-DD)"}, status=400)

        try:
            selected_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Formato de fecha invalido"}, status=400)

        # Obtener reservas existentes para esa cancha y fecha (no canceladas)
        existing = Reservation.objects.filter(
            court=court,
            date=selected_date,
        ).exclude(status=ReservationStatus.CANCELED).values("start_time", "end_time", "status")

        # Generar bloques de 1 hora entre apertura y cierre
        opening = datetime.combine(selected_date, court.opening_time)
        closing = datetime.combine(selected_date, court.closing_time)

        slots = []
        current = opening
        while current + timedelta(hours=1) <= closing:
            slot_start = current.time()
            slot_end = (current + timedelta(hours=1)).time()

            # Verificar si el slot se superpone con alguna reserva
            is_occupied = any(
                r["start_time"] < slot_end and r["end_time"] > slot_start
                for r in existing
            )

            slots.append({
                "start_time": slot_start.strftime("%H:%M"),
                "end_time": slot_end.strftime("%H:%M"),
                "available": not is_occupied,
            })
            current += timedelta(hours=1)

        return Response({
            "date": date_str,
            "court_id": court.id,
            "court_name": court.name,
            "opening_time": court.opening_time.strftime("%H:%M"),
            "closing_time": court.closing_time.strftime("%H:%M"),
            "price_per_hour": str(court.price_per_hour),
            "slots": slots,
        })
