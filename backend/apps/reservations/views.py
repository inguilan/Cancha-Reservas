from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.users.models import UserRole

from .models import Reservation, ReservationStatus
from .serializers import ReservationSerializer


class ReservationViewSet(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer
    filterset_fields = ["status", "court", "date"]
    search_fields = ["court__name", "user__username"]
    ordering_fields = ["date", "start_time", "created_at", "total_price"]

    def get_queryset(self):
        user = self.request.user
        queryset = Reservation.objects.select_related("court", "user").all()
        if user.role == UserRole.ADMIN:
            return queryset
        return queryset.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_permissions(self):
        if self.action in ["destroy"]:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        reservation = self.get_object()
        if request.user.role != UserRole.ADMIN:
            return Response({"detail": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)

        if reservation.status == ReservationStatus.CANCELED:
            return Response({"detail": "No se puede confirmar una reserva cancelada"}, status=status.HTTP_400_BAD_REQUEST)

        reservation.status = ReservationStatus.CONFIRMED
        reservation.save(update_fields=["status", "updated_at"])
        return Response(ReservationSerializer(reservation).data)

    @action(detail=True, methods=["post"])
    def finish(self, request, pk=None):
        reservation = self.get_object()
        if request.user.role != UserRole.ADMIN:
            return Response({"detail": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)

        if reservation.status == ReservationStatus.CANCELED:
            return Response({"detail": "No se puede finalizar una reserva cancelada"}, status=status.HTTP_400_BAD_REQUEST)

        reservation.status = ReservationStatus.FINISHED
        reservation.save(update_fields=["status", "updated_at"])
        return Response(ReservationSerializer(reservation).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        reservation = self.get_object()
        if request.user.role != UserRole.ADMIN and reservation.user_id != request.user.id:
            return Response({"detail": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)

        reservation.status = ReservationStatus.CANCELED
        reservation.save(update_fields=["status", "updated_at"])
        return Response(ReservationSerializer(reservation).data)
