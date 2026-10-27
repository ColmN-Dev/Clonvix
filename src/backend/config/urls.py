"""
URL configuration for clonvix config app.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, re_path, include
from django.http import JsonResponse
from django.views.generic import TemplateView

def api_status(request):
    return JsonResponse({'message': 'Clonvix backend is running successfully.'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/status/', api_status, name='api_status'),
    path('api/repositories/', include('repositories.urls')),
    re_path(r'^(?!api/|admin/|static/).*$', TemplateView.as_view(template_name='index.html')),
]
