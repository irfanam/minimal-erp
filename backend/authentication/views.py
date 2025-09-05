from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from django.contrib.auth import login, logout

from .serializers import LoginSerializer, UserProfileSerializer


class LoginView(APIView):
    """
    Authenticate the user with username/password and return JWT tokens.
    Flow:
    - Validate credentials with LoginSerializer
    - If valid, issue access and refresh tokens using Simple JWT
    - Return tokens and basic user info
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        # Optional: establish a Django session for browsable API convenience
        login(request, user)

        refresh = RefreshToken.for_user(user)
        data = {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserProfileSerializer(user, context={'request': request}).data,
        }
        return Response(data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    Logout by blacklisting the provided refresh token (if rotation/blacklist enabled)
    and ending the Django session.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # End Django session (for browsable API)
        logout(request)

        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()  # requires blacklist app if using blacklist features
            except Exception:
                # If blacklist app is not enabled, ignore errors
                pass
        return Response({'detail': 'Logged out'}, status=status.HTTP_200_OK)


class RefreshTokenView(TokenRefreshView):
    """
    Exchange a valid refresh token for a new access token.
    """
    permission_classes = [AllowAny]


class UserProfileView(APIView):
    """
    Return the authenticated user's profile information.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserProfileSerializer(request.user, context={'request': request}).data)
