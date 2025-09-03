from django.contrib import admin

from .models import Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'gstin', 'city', 'state', 'country', 'pincode', 'phone', 'email',
        'created_at', 'updated_at',
    )
    search_fields = ('name', 'gstin', 'city', 'state', 'pincode', 'phone', 'email')
    list_filter = ('state', 'country')
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')

    fieldsets = (
        ('Identity', {
            'fields': ('name', 'logo')
        }),
        ('Contact', {
            'fields': ('phone', 'email', 'website')
        }),
        ('Address', {
            'fields': ('address', 'city', 'state', 'country', 'pincode')
        }),
        ('Tax', {
            'fields': ('gstin',)
        }),
        ('Audit', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by')
        }),
    )
