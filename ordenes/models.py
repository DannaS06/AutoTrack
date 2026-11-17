from django.db import models
from django.conf import settings

class Vehiculo(models.Model):
    propietario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vehiculos', limit_choices_to={'rol': 'cliente'})
    placa = models.CharField(max_length=10, unique=True)
    marca = models.CharField(max_length=50)
    modelo = models.CharField(max_length=50)
    anio = models.IntegerField()
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.placa} - {self.marca} {self.modelo}"

class OrdenServicio(models.Model):
    ESTADOS = (
        ('recibido', 'Recibido en Taller'),
        ('diagnostico', 'En Diagnóstico'),
        ('reparacion', 'En Reparación'),
        ('finalizado', 'Listo para Entrega'),
    )
    vehiculo = models.ForeignKey(Vehiculo, on_delete=models.CASCADE, related_name='ordenes')
    mecanico = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='ordenes_asignadas', limit_choices_to={'rol': 'mecanico'})
    estado = models.CharField(max_length=20, choices=ESTADOS, default='recibido')
    diagnostico_inicial = models.TextField()
    costo_estimado = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Orden #{self.id} - {self.vehiculo.placa} ({self.estado})"

class HistorialEstado(models.Model):
    orden = models.ForeignKey(OrdenServicio, on_delete=models.CASCADE, related_name='historial')
    estado_anterior = models.CharField(max_length=20)
    estado_nuevo = models.CharField(max_length=20)
    observaciones = models.TextField(blank=True, null=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cambio en Orden #{self.orden.id}: {self.estado_anterior} -> {self.estado_nuevo}"