from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'rol', 'is_staff')
    list_filter = ('rol', 'is_staff')
    
    # Agrega el campo rol en el formulario de edición existente
    fieldsets = UserAdmin.fieldsets + (
        ('Información de Rol en AutoTrack', {'fields': ('rol',)}),
    )
    
    # Agrega el campo rol en el formulario de creación de nuevo usuario
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Información de Rol en AutoTrack', {'fields': ('rol',)}),
    )