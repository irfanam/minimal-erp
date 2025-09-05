from django.contrib import admin
from .models import Product, Inventory


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('sku', 'name', 'unit', 'selling_price', 'gst_rate', 'is_active', 'created_at')
    search_fields = ('sku', 'name', 'hsn_code')
    list_filter = ('unit', 'is_active')
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('product', 'on_hand', 'reorder_level', 'created_at')
    search_fields = ('product__sku', 'product__name')
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')
