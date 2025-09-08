from django.urls import path
from .views import dashboard_metrics, global_search

urlpatterns = [
    path('dashboard/metrics/', dashboard_metrics, name='dashboard-metrics'),
    path('search/', global_search, name='global-search'),
]
