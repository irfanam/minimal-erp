from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

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
