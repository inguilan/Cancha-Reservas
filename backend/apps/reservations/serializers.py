from rest_framework import serializers

from apps.courts.models import CourtStatus

from .models import Reservation, ReservationStatus


class ReservationSerializer(serializers.ModelSerializer):
    court_name = serializers.CharField(source="court.name", read_only=True)
    user_name = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Reservation
        fields = [
            "id",
            "user",
            "user_name",
            "court",
            "court_name",
            "date",
            "start_time",
            "end_time",
            "status",
            "total_price",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "total_price", "created_at", "updated_at", "user"]

    def validate(self, attrs):
        court = attrs.get("court", getattr(self.instance, "court", None))
        status = attrs.get("status", getattr(self.instance, "status", ReservationStatus.PENDING))

        if court and court.status == CourtStatus.MAINTENANCE and status != ReservationStatus.CANCELED:
            raise serializers.ValidationError("No se puede reservar una cancha en mantenimiento")

        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        validated_data["user"] = request.user
        return super().create(validated_data)
