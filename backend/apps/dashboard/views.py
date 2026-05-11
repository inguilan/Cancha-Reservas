from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.reservations.models import Reservation, ReservationStatus
from apps.users.models import UserRole

User = get_user_model()


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != UserRole.ADMIN:
            return Response({"detail": "No autorizado"}, status=403)

        total_reservations = Reservation.objects.count()
        confirmed_income = (
            Reservation.objects.filter(status__in=[ReservationStatus.CONFIRMED, ReservationStatus.FINISHED])
            .aggregate(total=Sum("total_price"))
            .get("total")
            or 0
        )
        registered_users = User.objects.count()

        top_courts = (
            Reservation.objects.values("court__name")
            .annotate(total=Count("id"))
            .order_by("-total")[:5]
        )

        status_breakdown = Reservation.objects.values("status").annotate(total=Count("id")).order_by("status")

        return Response(
            {
                "total_reservations": total_reservations,
                "confirmed_income": confirmed_income,
                "registered_users": registered_users,
                "top_courts": list(top_courts),
                "status_breakdown": list(status_breakdown),
            }
        )
