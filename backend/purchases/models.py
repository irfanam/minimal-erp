from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator, EmailValidator
from django.db import models

from core.models import BaseModel

GSTIN_REGEX = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
validate_gstin = RegexValidator(regex=GSTIN_REGEX, message='Enter a valid GSTIN (15 characters).')
validate_phone = RegexValidator(regex=r"^[0-9+()\-\s]{6,20}$", message="Enter a valid phone number.")


class Supplier(BaseModel):
    code = models.CharField(max_length=32, unique=True)
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True, validators=[validate_phone])
    email = models.EmailField(blank=True, validators=[EmailValidator()])
    address = models.TextField(blank=True)
    gstin = models.CharField(max_length=15, blank=True, null=True, validators=[validate_gstin])
    state_code = models.CharField(max_length=2, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("name",)
        indexes = [
            models.Index(fields=["code"]),
            models.Index(fields=["name"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.code} - {self.name}"
