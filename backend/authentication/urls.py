from django.urls import path
from .views import LoginView, LogoutView, RefreshTokenView, UserProfileView

urlpatterns = [
    path('login/', LoginView.as_view(), name='auth-login'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('refresh/', RefreshTokenView.as_view(), name='auth-refresh'),
    path('profile/', UserProfileView.as_view(), name='auth-profile'),
]
