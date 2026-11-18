from rest_framework import serializers
from .models import Vehiculo, OrdenServicio, HistorialEstado

class VehiculoSerializer(serializers.ModelSerializer):
    propietario_nombre = serializers.CharField(source='propietario.username', read_only=True)

    class Meta:
        model = Vehiculo
        fields = ['id', 'propietario', 'propietario_nombre', 'placa', 'marca', 'modelo', 'anio']

class OrdenServicioSerializer(serializers.ModelSerializer):
    vehiculo_placa = serializers.CharField(source='vehiculo.placa', read_only=True)
    vehiculo_info = serializers.SerializerMethodField()
    propietario_nombre = serializers.CharField(source='vehiculo.propietario.username', read_only=True)
    mecanico_nombre = serializers.CharField(source='mecanico.username', read_only=True, default='Sin asignar')

    class Meta:
        model = OrdenServicio
        fields = [
            'id', 'vehiculo', 'vehiculo_placa', 'vehiculo_info', 
            'propietario_nombre', 'mecanico', 'mecanico_nombre', 
            'estado', 'diagnostico_inicial', 'costo_estimado', 
            'fecha_creacion', 'fecha_actualizacion'
        ]

    def get_vehiculo_info(self, obj):
        return f"{obj.vehiculo.marca} {obj.vehiculo.modelo} ({obj.vehiculo.anio})"