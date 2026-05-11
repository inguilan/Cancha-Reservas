from rest_framework import serializers

from .models import Court


class CourtSerializer(serializers.ModelSerializer):
    class Meta:
        model = Court
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        opening_time = attrs.get("opening_time", getattr(self.instance, "opening_time", None))
        closing_time = attrs.get("closing_time", getattr(self.instance, "closing_time", None))
        if opening_time and closing_time and opening_time >= closing_time:
            raise serializers.ValidationError("La hora de apertura debe ser menor que la hora de cierre")
        return attrs
