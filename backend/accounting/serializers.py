from rest_framework import serializers

from .models import Invoice, InvoiceLine
from utils.gst_utils import convert_amount_to_words


class InvoiceLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = InvoiceLine
        fields = [
            'id', 'product', 'product_name', 'description', 'quantity', 'unit', 'unit_price', 'gst_rate', 'hsn_code', 'line_total'
        ]
        read_only_fields = ['id', 'line_total']


class InvoiceSerializer(serializers.ModelSerializer):
    lines = InvoiceLineSerializer(many=True, required=False)
    amount_in_words = serializers.SerializerMethodField()
    pdf_generated = serializers.BooleanField(read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'customer', 'sales_order', 'invoice_date', 'due_date', 'status', 'gst_type', 'currency_code',
            'subtotal', 'cgst_amount', 'sgst_amount', 'igst_amount', 'total_tax', 'grand_total',
            'paid_amount', 'balance_amount', 'payment_status', 'pdf_generated', 'amount_in_words',
            'lines', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = (
            'id', 'subtotal', 'cgst_amount', 'sgst_amount', 'igst_amount', 'total_tax', 'grand_total',
            'paid_amount', 'balance_amount', 'payment_status', 'pdf_generated', 'amount_in_words',
            'created_at', 'updated_at', 'created_by', 'updated_by'
        )

    def get_amount_in_words(self, obj: Invoice):
        return convert_amount_to_words(obj.grand_total)

    def create(self, validated_data):
        lines_data = validated_data.pop('lines', [])
        invoice = Invoice.objects.create(**validated_data)
        for line in lines_data:
            InvoiceLine.objects.create(invoice=invoice, **line)
        invoice.calculate_totals(save=True)
        return invoice

    def update(self, instance: Invoice, validated_data):
        lines_data = validated_data.pop('lines', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if lines_data is not None:
            instance.lines.all().delete()
            for line in lines_data:
                InvoiceLine.objects.create(invoice=instance, **line)
        instance.calculate_totals(save=True)
        return instance
