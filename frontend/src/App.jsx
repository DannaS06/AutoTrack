import React, { useState, useEffect } from 'react';
import api from './api/axios';

export default function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Manejo de Login (JWT)
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login/', { username, password });
      localStorage.setItem('access_token', res.data.access);
      setUser(res.data.user);
    } catch (err) {
      setError('Credenciales inválidas. Verifica tu usuario y contraseña.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setOrdenes([]);
  };

  // 2. Obtener Órdenes de la API
  const fetchOrdenes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ordenes/');
      setOrdenes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Cambiar estado de una orden (Admin y Mecánico)
  const handleCambiarEstado = async (ordenId, nuevoEstado) => {
    try {
      await api.patch(`/ordenes/${ordenId}/cambiar-estado/`, {
        nuevo_estado: nuevoEstado,
        observacion: `Estado actualizado a ${nuevoEstado} por ${user.username}`
      });
      fetchOrdenes(); // Refresca los datos en pantalla
    } catch (err) {
      console.error(err);
      alert('Error al actualizar el estado de la orden');
    }
  };

  // Efecto para cargar órdenes cuando el usuario inicia sesión
  useEffect(() => {
    if (user) {
      fetchOrdenes();
    }
  }, [user]);

  // 4. Helper para la barra de seguimiento visual
  const getStepStatus = (currentEstado, stepName) => {
    const order = ['recibido', 'diagnostico', 'reparacion', 'finalizado'];
    const currentIndex = order.indexOf(currentEstado);
    const stepIndex = order.indexOf(stepName);

    if (currentIndex > stepIndex) return 'bg-emerald-600 text-white font-semibold'; // Completado
    if (currentIndex === stepIndex) return 'bg-blue-600 text-white font-bold ring-2 ring-blue-300'; // En curso
    return 'bg-slate-200 text-slate-500'; // Pendiente
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      {/* Navbar */}
      <header className="bg-slate-900 text-white py-4 px-8 flex justify-between items-center shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-500"></span>
            <h1 className="text-xl font-extrabold tracking-wider text-white">AUTOTRACK</h1>
          </div>
          <p className="text-xs text-slate-400">Sistema de Trazabilidad de Servicios Automotrices</p>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              Usuario: <strong className="text-blue-400">{user.username}</strong> | Rol: <span className="uppercase font-bold text-amber-400">{user.rol}</span>
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-xs px-3.5 py-2 rounded-lg font-semibold transition cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {!user ? (
          /* FORMULARIO DE LOGIN */
          <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
            <h2 className="text-2xl font-black text-center text-slate-900">Iniciar Sesión</h2>
            <p className="text-sm text-slate-500 mb-6 text-center">Accede para consultar el estado de tu vehículo</p>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-4 text-sm border border-red-200">{error}</div>}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nombre de Usuario</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border border-slate-300 px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-300 px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-md cursor-pointer"
              >
                Ingresar al Sistema
              </button>
            </form>
          </div>
        ) : (
          /* VISTA DEL DASHBOARD / SEGUIMIENTO */
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Órdenes de Servicio en Taller</h2>
                <p className="text-xs text-slate-500">Trazabilidad de fases de servicio técnico en tiempo real</p>
              </div>
              <button
                onClick={fetchOrdenes}
                className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Refrescar Estados
              </button>
            </div>

            {loading ? (
              <p className="text-center py-10 text-slate-500">Consultando datos del servidor...</p>
            ) : ordenes.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
                No hay órdenes de servicio activas para este usuario.
              </div>
            ) : (
              <div className="space-y-6">
                {ordenes.map((orden) => (
                  <div key={orden.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md">
                            Orden #{orden.id}
                          </span>
                          <span className="text-xs font-bold uppercase bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                            Placa: {orden.vehiculo_placa}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 mt-2"><b>Diagnóstico:</b> {orden.diagnostico_inicial}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold uppercase text-slate-400">Total Estimado</span>
                        <p className="text-xl font-extrabold text-slate-900">${Number(orden.costo_estimado).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* BARRA DE PROGRESO DE ESTADOS */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs font-bold uppercase text-slate-400 mb-3">Línea de Trazabilidad</p>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className={`py-2 rounded-xl ${getStepStatus(orden.estado, 'recibido')}`}>1. Recibido</div>
                        <div className={`py-2 rounded-xl ${getStepStatus(orden.estado, 'diagnostico')}`}>2. Diagnóstico</div>
                        <div className={`py-2 rounded-xl ${getStepStatus(orden.estado, 'reparacion')}`}>3. Reparación</div>
                        <div className={`py-2 rounded-xl ${getStepStatus(orden.estado, 'finalizado')}`}>4. Finalizado</div>
                      </div>
                    </div>

                    {/* CONTROLES DE TRANSICIÓN: ADMIN Y MECÁNICO */}
                    {(user.rol === 'admin' || user.rol === 'mecanico') && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs font-bold uppercase text-slate-500">Avanzar fase:</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCambiarEstado(orden.id, 'diagnostico')}
                            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer border ${
                              orden.estado === 'diagnostico' ? 'bg-amber-500 text-white border-amber-600' : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                            }`}
                          >
                            A Diagnóstico
                          </button>
                          <button
                            onClick={() => handleCambiarEstado(orden.id, 'reparacion')}
                            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer border ${
                              orden.estado === 'reparacion' ? 'bg-blue-600 text-white border-blue-700' : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-300'
                            }`}
                          >
                            A Reparación
                          </button>
                          <button
                            onClick={() => handleCambiarEstado(orden.id, 'finalizado')}
                            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer border ${
                              orden.estado === 'finalizado' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                            }`}
                          >
                            Listo / Finalizar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}