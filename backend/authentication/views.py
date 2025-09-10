
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from django.contrib.auth import login, logout
import logging

from .serializers import LoginSerializer, UserProfileSerializer

logger = logging.getLogger(__name__)


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
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            logger.warning(f"Login failed for {request.data.get('username')}: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.validated_data['user']
        login(request, user)
        refresh = RefreshToken.for_user(user)
        logger.info(f"User {user.username} logged in.")
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
        logout(request)
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
                logger.info(f"Refresh token blacklisted for user {request.user.username}")
            except Exception as e:
                logger.warning(f"Failed to blacklist token: {e}")
        logger.info(f"User {request.user.username} logged out.")
        return Response({'detail': 'Logged out'}, status=status.HTTP_200_OK)


class RefreshTokenView(TokenRefreshView):
    """
    Exchange a valid refresh token for a new access token.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            logger.info("Token refreshed.")
            return response
        except Exception as e:
            logger.warning(f"Token refresh failed: {e}")
            return Response({'error': 'Invalid or expired refresh token.'}, status=status.HTTP_401_UNAUTHORIZED)


class UserProfileView(APIView):
    """
    Return the authenticated user's profile information.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserProfileSerializer(request.user, context={'request': request}).data)
