from .settings_base import *  # noqa

DEBUG = False

# Production-grade security
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

print('[settings_prod] Production security enabled (HTTPS redirect ON)')