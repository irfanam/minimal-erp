from .settings_base import *  # noqa

DEBUG = True

# Explicitly relax security for local development
SECURE_SSL_REDIRECT = False
SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

print('[settings_dev] DEBUG=True SECURE_SSL_REDIRECT=False (local dev)')