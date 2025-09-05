from rest_framework import serializers

from .models import Invoice, InvoiceLine


class InvoiceLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceLine
        fields = ['id', 'product', 'description', 'quantity', 'unit', 'unit_price', 'gst_rate']
        read_only_fields = ['id']


class InvoiceSerializer(serializers.ModelSerializer):
    # Nested lines for reads and writes
    lines = InvoiceLineSerializer(many=True, required=False)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'customer', 'invoice_date', 'due_date', 'status', 'gst_type', 'currency_code',
            'subtotal', 'cgst_amount', 'sgst_amount', 'igst_amount', 'total_tax', 'grand_total',
            'lines', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = (
            'id', 'subtotal', 'cgst_amount', 'sgst_amount', 'igst_amount', 'total_tax', 'grand_total',
            'created_at', 'updated_at', 'created_by', 'updated_by'
        )

    def create(self, validated_data):
        lines_data = validated_data.pop('lines', [])
        invoice = Invoice.objects.create(**validated_data)
        for line in lines_data:
            InvoiceLine.objects.create(invoice=invoice, **line)
        # compute totals
        invoice.calculate_totals(save=True)
        return invoice

    def update(self, instance: Invoice, validated_data):
        lines_data = validated_data.pop('lines', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        # If lines provided, replace existing lines
        if lines_data is not None:
            instance.lines.all().delete()
            for line in lines_data:
                InvoiceLine.objects.create(invoice=instance, **line)
        instance.calculate_totals(save=True)
        return instance
