from rest_framework import serializers

from .models import Product, Inventory, StockEntry, StockEntryLine, StockLedger


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'name', 'description', 'hsn_code', 'unit',
            'cost_price', 'selling_price', 'gst_rate', 'is_active',
            'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at', 'created_by', 'updated_by')


class InventorySerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = Inventory
        fields = [
            'id', 'product', 'product_detail', 'on_hand', 'reorder_level',
            'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at', 'created_by', 'updated_by')


class StockEntryLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = StockEntryLine
        fields = ['id', 'product', 'product_name', 'quantity', 'rate', 'amount']
        read_only_fields = ['id', 'amount']


class StockEntrySerializer(serializers.ModelSerializer):
    lines = StockEntryLineSerializer(many=True)

    class Meta:
        model = StockEntry
        fields = [
            'id', 'reference_number', 'entry_type', 'entry_date', 'remarks', 'lines',
            'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'entry_date', 'created_at', 'updated_at', 'created_by', 'updated_by']

    def create(self, validated_data):
        lines_data = validated_data.pop('lines', [])
        entry = StockEntry.objects.create(**validated_data)
        for line in lines_data:
            StockEntryLine.objects.create(stock_entry=entry, **line)
        entry.apply_to_inventory()
        return entry

    def update(self, instance: StockEntry, validated_data):
        lines_data = validated_data.pop('lines', None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        if lines_data is not None:
            instance.lines.all().delete()
            for line in lines_data:
                StockEntryLine.objects.create(stock_entry=instance, **line)
            # Reapply inventory effect: simplistic (could compute delta)
            instance.apply_to_inventory()
        return instance


class StockLedgerSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = StockLedger
        fields = [
            'id', 'product', 'product_name', 'movement_date', 'qty_change', 'balance_qty', 'rate'
        ]
        read_only_fields = ['id']
