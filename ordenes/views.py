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
        
        # Solo mecánicos (o admin si se requiere) pueden operar fases, pero respetando secuencia
        if request.user.rol == 'cliente':
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)

        nuevo_estado = request.data.get('nuevo_estado')
        observacion = request.data.get('observacion', '')
        costo_final = request.data.get('costo_final')

        # Validar secuencia estricta (RF-05)
        transiciones_validas = {
            'recibido': 'diagnostico',
            'diagnostico': 'reparacion',
            'reparacion': 'finalizado'
        }

        if transiciones_validas.get(orden.estado) != nuevo_estado:
            return Response(
                {'error': f'Transición inválida: no puedes pasar de {orden.estado} a {nuevo_estado}.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if nuevo_estado == 'finalizado' and costo_final is not None:
            orden.costo_estimado = costo_final

        estado_anterior = orden.estado
        orden.estado = nuevo_estado
        orden.save()

        HistorialEstado.objects.create(
            orden=orden,
            estado_anterior=estado_anterior,
            estado_nuevo=nuevo_estado,
            observaciones=observacion
        )

        return Response(OrdenServicioSerializer(orden).data, status=status.HTTP_200_OK)