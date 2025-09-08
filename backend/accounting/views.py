from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from decimal import Decimal
from django.utils import timezone

from .models import Invoice
from .serializers import InvoiceSerializer
from sales.views import IsManagerOrAdmin
from utils.gst_utils import convert_amount_to_words


class DefaultPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 200


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related('customer', 'created_by', 'updated_by').prefetch_related('lines').all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsManagerOrAdmin]
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['invoice_number', 'customer__name']
    ordering_fields = ['invoice_date', 'invoice_number', 'grand_total', 'created_at']
    ordering = ['-invoice_date']

    def get_queryset(self):
        qs = super().get_queryset()
        p = self.request.query_params
        status_param = p.get('status')
        cust = p.get('customer')
        date_from = p.get('date_from')
        date_to = p.get('date_to')
        if status_param:
            qs = qs.filter(status=status_param)
        if cust:
            qs = qs.filter(customer_id=cust)
        if date_from:
            qs = qs.filter(invoice_date__gte=date_from)
        if date_to:
            qs = qs.filter(invoice_date__lte=date_to)
        return qs

    def perform_create(self, serializer):
        invoice = serializer.save(created_by=self.request.user, updated_by=self.request.user)
        # calculate_totals already called by serializer, but ensure it
        invoice.calculate_totals(save=True)

    def perform_update(self, serializer):
        invoice = serializer.save(updated_by=self.request.user)
        invoice.calculate_totals(save=True)

    @action(detail=True, methods=['get'], url_path='totals')
    def totals(self, request, pk=None):
        invoice = self.get_object()
        invoice.calculate_totals(save=False)
        return Response({
            'subtotal': invoice.subtotal,
            'cgst_amount': invoice.cgst_amount,
            'sgst_amount': invoice.sgst_amount,
            'igst_amount': invoice.igst_amount,
            'total_tax': invoice.total_tax,
            'grand_total': invoice.grand_total,
        })

    @action(detail=True, methods=['get'], url_path='amount-in-words')
    def amount_in_words(self, request, pk=None):
        invoice = self.get_object()
        invoice.calculate_totals(save=False)
        return Response({'amount_in_words': convert_amount_to_words(invoice.grand_total)})

    @action(detail=True, methods=['post'], url_path='generate-pdf')
    def generate_pdf(self, request, pk=None):
        invoice = self.get_object()
        # Placeholder: mark pdf_generated
        invoice.pdf_generated = True
        invoice.save(update_fields=['pdf_generated', 'updated_at'])
        return Response({'pdf_generated': True})

    @action(detail=True, methods=['post'], url_path='send-email')
    def send_email(self, request, pk=None):
        invoice = self.get_object()
        # Placeholder email logic
        # In production integrate with actual email service
        return Response({'sent': True, 'invoice_id': invoice.id})

    @action(detail=True, methods=['post'], url_path='mark-paid')
    def mark_paid(self, request, pk=None):
        invoice = self.get_object()
        invoice.apply_payment(invoice.grand_total - invoice.paid_amount)
        return Response(self.get_serializer(invoice).data)

    @action(detail=True, methods=['post'], url_path='record-payment')
    def record_payment(self, request, pk=None):
        invoice = self.get_object()
        amount = request.data.get('amount')
        try:
            amount_dec = Decimal(str(amount))
        except Exception:
            return Response({'detail': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)
        if amount_dec <= 0:
            return Response({'detail': 'Amount must be positive'}, status=status.HTTP_400_BAD_REQUEST)
        invoice.apply_payment(amount_dec)
        return Response(self.get_serializer(invoice).data)
