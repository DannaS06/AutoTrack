from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Vehiculo, OrdenServicio, HistorialEstado
from .serializers import VehiculoSerializer, OrdenServicioSerializer

class VehiculoViewSet(viewsets.ModelViewSet):
    serializer_class = VehiculoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Si es cliente, solo ve sus autos; si es admin/mecanico, ve todos
        if self.request.user.rol == 'cliente':
            return Vehiculo.objects.filter(propietario=self.request.user)
        return Vehiculo.objects.all()

    def perform_create(self, serializer):
        serializer.save(propietario=self.request.user)

class OrdenServicioViewSet(viewsets.ModelViewSet):
    serializer_class = OrdenServicioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.rol == 'cliente':
            return OrdenServicio.objects.filter(vehiculo__propietario=user)
        elif user.rol == 'mecanico':
            return OrdenServicio.objects.filter(mecanico=user)  # <-- Solo las asignadas a él/ella
        return OrdenServicio.objects.all()  # El admin sí ve todo el taller

    @action(detail=True, methods=['patch'], url_path='cambiar-estado')
    def cambiar_estado(self, request, pk=None):
        orden = self.get_object()
        nuevo_estado = request.data.get('nuevo_estado')
        observacion = request.data.get('observacion', '')

        if not nuevo_estado:
            return Response({'error': 'Debe proveer nuevo_estado'}, status=status.HTTP_400_BAD_REQUEST)

        estado_anterior = orden.estado
        orden.estado = nuevo_estado
        orden.save()

        # Guardar en historial de auditoría
        HistorialEstado.objects.create(
            orden=orden,
            estado_anterior=estado_anterior,
            estado_nuevo=nuevo_estado,
            observaciones=observacion
        )

        return Response(OrdenServicioSerializer(orden).data, status=status.HTTP_200_OK)