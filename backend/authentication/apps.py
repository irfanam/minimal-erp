from django.apps import AppConfig


class AuthenticationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'authentication'

    def ready(self):  # pragma: no cover (import side effects only)
        from . import signals  # noqa: F401
