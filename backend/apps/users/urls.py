from django.urls import path

from .views import (
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
    TokenLoginView,
    TokenRefreshTokenView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", TokenLoginView.as_view(), name="token-obtain-pair"),
    path("refresh/", TokenRefreshTokenView.as_view(), name="token-refresh"),
    path("password-reset/request/", PasswordResetRequestView.as_view(), name="password-reset-request"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
]
