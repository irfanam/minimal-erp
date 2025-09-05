from django.contrib import admin
from .models import Supplier


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'phone', 'email', 'is_active', 'created_at')
    search_fields = ('code', 'name', 'phone', 'email', 'gstin')
    list_filter = ('is_active',)
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')
