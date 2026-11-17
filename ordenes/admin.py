from django.contrib import admin
from .models import Vehiculo, OrdenServicio, HistorialEstado

admin.site.register(Vehiculo)
admin.site.register(OrdenServicio)
admin.site.register(HistorialEstado)