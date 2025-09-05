from django.contrib import admin

from .models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = (
        'customer_code', 'name', 'contact_person', 'phone', 'email', 'state_code', 'is_active',
        'credit_limit', 'payment_terms', 'created_at', 'updated_at'
    )
    search_fields = ('customer_code', 'name', 'phone', 'email', 'gstin')
    list_filter = ('is_active', 'state_code')
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')

    fieldsets = (
        ('Identity', {'fields': ('customer_code', 'name', 'is_active')}),
        ('Contacts', {'fields': ('contact_person', 'phone', 'email')}),
        ('Addresses', {'fields': ('billing_address', 'shipping_address')}),
        ('Tax', {'fields': ('gstin', 'state_code')}),
        ('Credit & Terms', {'fields': ('credit_limit', 'payment_terms')}),
        ('Audit', {'classes': ('collapse',), 'fields': ('created_at', 'updated_at', 'created_by', 'updated_by')}),
    )
