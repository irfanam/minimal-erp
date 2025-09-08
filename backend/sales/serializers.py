from rest_framework import serializers
from django.db import transaction
from decimal import Decimal

from .models import Customer, SalesOrder, SalesOrderLine


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


class SalesOrderLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = SalesOrderLine
        fields = [
            'id', 'product', 'product_name', 'description', 'quantity', 'rate',
            'discount_amount', 'tax_rate', 'amount', 'tax_amount', 'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'amount', 'tax_amount', 'created_at', 'updated_at')


class SalesOrderSerializer(serializers.ModelSerializer):
    customer_detail = CustomerSerializer(source='customer', read_only=True)
    lines = SalesOrderLineSerializer(many=True)
    status = serializers.CharField(read_only=False)

    class Meta:
        model = SalesOrder
        fields = [
            'id', 'order_number', 'customer', 'customer_detail', 'order_date', 'delivery_date', 'status',
            'notes', 'subtotal', 'tax_amount', 'total_amount', 'lines', 'created_at', 'updated_at',
            'created_by', 'updated_by'
        ]
        read_only_fields = ('id', 'subtotal', 'tax_amount', 'total_amount', 'created_at', 'updated_at', 'created_by', 'updated_by')

    def validate_order_number(self, value):
        if not value:
            raise serializers.ValidationError('Order number required')
        return value

    def validate(self, attrs):
        status = attrs.get('status') or getattr(self.instance, 'status', SalesOrder.Status.DRAFT)
        delivery_date = attrs.get('delivery_date') or getattr(self.instance, 'delivery_date', None)
        if status == SalesOrder.Status.DELIVERED and not delivery_date:
            raise serializers.ValidationError({'delivery_date': 'Delivery date required when marking delivered.'})
        return attrs

    def _upsert_lines(self, order: SalesOrder, lines_data):
        existing_ids = {l.id: l for l in order.lines.all()}
        seen = set()
        for line in lines_data:
            line_id = line.get('id')
            if line_id and line_id in existing_ids:
                obj = existing_ids[line_id]
                for f in ['product', 'description', 'quantity', 'rate', 'discount_amount', 'tax_rate']:
                    if f in line:
                        setattr(obj, f, line[f])
                obj.save()
                seen.add(line_id)
            else:
                SalesOrderLine.objects.create(order=order, **line)
        # delete removed lines
        for lid, lobj in existing_ids.items():
            if lid not in seen:
                lobj.delete()

    @transaction.atomic
    def create(self, validated_data):
        lines_data = validated_data.pop('lines', [])
        order = SalesOrder.objects.create(**validated_data)
        for line in lines_data:
            SalesOrderLine.objects.create(order=order, **line)
        order.recalc_totals()
        order.save()
        return order

    @transaction.atomic
    def update(self, instance: SalesOrder, validated_data):
        lines_data = validated_data.pop('lines', None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        if lines_data is not None:
            self._upsert_lines(instance, lines_data)
        instance.refresh_from_db()
        return instance
