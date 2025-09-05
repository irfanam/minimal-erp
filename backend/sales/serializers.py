from rest_framework import serializers

from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            'id', 'customer_code', 'name', 'contact_person', 'phone', 'email',
            'billing_address', 'shipping_address', 'gstin', 'state_code',
            'credit_limit', 'payment_terms', 'is_active',
            'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at', 'created_by', 'updated_by')
