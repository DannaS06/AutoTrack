from rest_framework import serializers
from .models import Vehiculo, OrdenServicio, HistorialEstado

class VehiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehiculo
        fields = '__all__'
        read_only_fields = ['propietario']

class HistorialEstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistorialEstado
        fields = '__all__'

class OrdenServicioSerializer(serializers.ModelSerializer):
    historial = HistorialEstadoSerializer(many=True, read_only=True)
    vehiculo_placa = serializers.CharField(source='vehiculo.placa', read_only=True)

    class Meta:
        model = OrdenServicio
        fields = '__all__'