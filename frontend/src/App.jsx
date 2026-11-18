import { useState, useEffect } from 'react';
import axios from 'axios';

const CarIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-3.6a2 2 0 00-1.6-.8H9.3a2 2 0 00-1.6.8L5 11l-5.16.86a1 1 0 00-.84.99V16h3m14 0a2 2 0 11-4 0 2 2 0 014 0zM7 16a2 2 0 11-4 0 2 2 0 014 0z"/>
  </svg>
);

const WrenchIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

const CheckCircleIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const [userRol, setUserRol] = useState(localStorage.getItem('user_rol') || null);
  const [userName, setUserName] = useState(localStorage.getItem('user_name') || '');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [ordenes, setOrdenes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [ordenExpandida, setOrdenExpandida] = useState(null);

  // Modal de Creación (Admin)
  const [showModalCrear, setShowModalCrear] = useState(false);
  const [vehiculoId, setVehiculoId] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [costoEstimado, setCostoEstimado] = useState('');
  const [creando, setCreando] = useState(false);

  // Modal de Avance / Cierre Técnico (Mecánico)
  const [ordenParaAvanzar, setOrdenParaAvanzar] = useState(null);
  const [siguienteFase, setSiguienteFase] = useState('');
  const [observacionTecnica, setObservacionTecnica] = useState('');
  const [costoFinalReal, setCostoFinalReal] = useState('');
  const [actualizando, setActualizando] = useState(false);

  const API_URL = 'http://localhost:8000/api/v1';

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await axios.post(`${API_URL}/auth/login/`, { 
        username: usernameInput, 
        password: passwordInput 
      });
      
      const accessToken = res.data.access;
      const rol = res.data.user?.rol || res.data.rol || 'cliente';
      const nombre = res.data.user?.username || usernameInput;

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('user_rol', rol);
      localStorage.setItem('user_name', nombre);
      
      // Limpieza inmediata de credenciales en memoria por seguridad
      setUsernameInput('');
      setPasswordInput('');
      
      setToken(accessToken);
      setUserRol(rol);
      setUserName(nombre);
    } catch (err) {
      setAuthError('Usuario o contraseña incorrectos. Intenta nuevamente.');
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_rol');
    localStorage.removeItem('user_name');
    setToken(null);
    setUserRol(null);
    setUserName('');
    setUsernameInput('');
    setPasswordInput('');
    setAuthError('');
    setOrdenes([]);
    setVehiculos([]);
    setFiltroEstado('todas');
    setOrdenExpandida(null);
  };

  const fetchOrdenes = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/ordenes/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrdenes(res.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehiculos = async () => {
    if (!token || userRol !== 'admin') return;
    try {
      const res = await axios.get(`${API_URL}/vehiculos/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehiculos(res.data);
      if (res.data.length > 0) setVehiculoId(res.data[0].id);
    } catch (err) {
      console.error('Error cargando vehículos:', err);
    }
  };

  const handleCrearOrden = async (e) => {
    e.preventDefault();
    setCreando(true);
    try {
      await axios.post(
        `${API_URL}/ordenes/`,
        {
          vehiculo: Number(vehiculoId),
          diagnostico_inicial: diagnostico,
          costo_estimado: Number(costoEstimado || 0),
          estado: 'recibido'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModalCrear(false);
      setDiagnostico('');
      setCostoEstimado('');
      fetchOrdenes();
    } catch (err) {
      alert('Error al crear la orden. Revisa los datos ingresados.');
    } finally {
      setCreando(false);
    }
  };

  const getSiguientePasoInfo = (estadoActual) => {
    switch (estadoActual) {
      case 'recibido':
        return { codigo: 'diagnostico', texto: 'Iniciar Diagnóstico' };
      case 'diagnostico':
        return { codigo: 'reparacion', texto: 'Pasar a Reparación' };
      case 'reparacion':
        return { codigo: 'finalizado', texto: 'Finalizar y Liquidar' };
      default:
        return null;
    }
  };

  const abrirModalAvance = (e, orden) => {
    e.stopPropagation();
    const sig = getSiguientePasoInfo(orden.estado);
    if (!sig) return;
    setOrdenParaAvanzar(orden);
    setSiguienteFase(sig.codigo);
    setObservacionTecnica('');
    setCostoFinalReal(orden.costo_estimado || '');
  };

  const confirmarAvanceFase = async (e) => {
    e.preventDefault();
    setActualizando(true);
    try {
      const payload = {
        nuevo_estado: siguienteFase,
        observacion: observacionTecnica
      };
      if (siguienteFase === 'finalizado') {
        payload.costo_final = Number(costoFinalReal);
      }

      await axios.patch(
        `${API_URL}/ordenes/${ordenParaAvanzar.id}/cambiar-estado/`, 
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrdenParaAvanzar(null);
      fetchOrdenes();
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo actualizar la fase.');
    } finally {
      setActualizando(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrdenes();
      if (userRol === 'admin') fetchVehiculos();
    }
  }, [token, userRol]);

  const formatNombre = (rawName) => {
    if (!rawName) return 'Usuario';
    return rawName.replace('_', ' ');
  };

  const getStepClass = (estadoActual, paso) => {
    const orden = ['recibido', 'diagnostico', 'reparacion', 'finalizado'];
    const actualIdx = orden.indexOf(estadoActual?.toLowerCase());
    const pasoIdx = orden.indexOf(paso);
    
    if (actualIdx > pasoIdx) return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
    if (actualIdx === pasoIdx) return 'bg-blue-600 text-white shadow-md shadow-blue-200 border-blue-600 font-bold';
    return 'bg-slate-50 text-slate-400 border-slate-200';
  };

  // --- VISTA 1: LOGIN CON FONDO DE TALLER OPACO ---
  if (!token) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 font-sans relative bg-slate-950 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1920&q=80')`
        }}
      >
        {/* Capa oscura opaca para contraste y legibilidad */}
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px]"></div>

        <div className="relative z-10 max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-5 border border-white/10">
          
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-8 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2.5 bg-blue-600/20 border border-blue-500/30 px-3 py-1.5 rounded-xl mb-6">
                <CarIcon className="h-5 w-5 text-blue-400" />
                <span className="text-xs font-extrabold tracking-widest text-blue-300">AUTOTRACK</span>
              </div>
              <h1 className="text-2xl font-black leading-snug tracking-tight mb-3">
                Control total de tu vehículo en taller.
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Consulta diagnósticos técnicos, presupuestos aprobados y el avance de reparación en tiempo real.
              </p>
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-slate-700/60 space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <ShieldIcon />
                <span>Acceso protegido por roles</span>
              </div>
              <p className="text-[11px] text-slate-400">Centro de Servicio Automotriz • Portal Digital</p>
            </div>
          </div>

          <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center bg-white">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900">Bienvenido de nuevo</h2>
              <p className="text-sm text-slate-500 mt-1">Ingresa tus credenciales para acceder al panel</p>
            </div>

            {authError && (
              <div className="bg-red-50 text-red-700 p-3.5 rounded-xl mb-6 text-xs font-semibold border border-red-200 flex items-center gap-2">
                <WrenchIcon /> {authError}
              </div>
            )}

            <form onSubmit={handleLogin} autoComplete="off" className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Usuario</label>
                <input 
                  type="text" 
                  name="autotrack_user"
                  autoComplete="off"
                  placeholder="Ingresa tu usuario"
                  value={usernameInput} 
                  onChange={(e) => setUsernameInput(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all outline-none" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Contraseña</label>
                <input 
                  type="password" 
                  name="autotrack_pass"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={passwordInput} 
                  onChange={(e) => setPasswordInput(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all outline-none" 
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex justify-center gap-2 items-center cursor-pointer mt-2"
              >
                Iniciar Sesión <WrenchIcon />
              </button>
            </form>
          </div>

        </div>
      </div>
    );
  }

  // --- VISTA 2: DASHBOARD ---
  const enProceso = ordenes.filter(o => o.estado !== 'finalizado').length;
  const finalizadas = ordenes.filter(o => o.estado === 'finalizado').length;

  const ordenesFiltradas = ordenes.filter((o) => {
    if (filtroEstado === 'en_taller') return o.estado !== 'finalizado';
    if (filtroEstado === 'finalizadas') return o.estado === 'finalizado';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100/80 font-sans text-slate-800">
      
      <header className="bg-slate-900 border-b border-slate-800 py-3.5 px-6 md:px-12 flex justify-between items-center shadow-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl text-white shadow-sm">
            <CarIcon />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-white m-0 leading-none">AUTOTRACK</h1>
            <p className="text-[11px] text-slate-400 m-0 mt-0.5">Trazabilidad de Servicios Automotrices</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-white m-0">
              Hola, <span className="text-blue-300">{formatNombre(userName)}</span>
            </p>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-blue-300 border border-slate-700 mt-0.5">
              {userRol}
            </span>
          </div>
          <button 
            onClick={handleLogout} 
            className="bg-slate-800 hover:bg-red-600/90 text-slate-200 hover:text-white border border-slate-700 hover:border-red-500 text-xs px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 md:p-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {userRol === 'cliente' ? 'Mis Vehículos en Taller' : userRol === 'mecanico' ? 'Mis Órdenes Asignadas' : 'Supervisión General del Taller'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {userRol === 'cliente' 
                ? 'Haz clic en una tarjeta para ver detalles técnicos y responsables' 
                : userRol === 'mecanico'
                ? 'Gestiona secuencialmente las reparaciones bajo tu responsabilidad'
                : 'Control administrativo de vehículos, propietarios y técnicos asignados'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {userRol === 'admin' && (
              <button 
                onClick={() => setShowModalCrear(true)} 
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <PlusIcon /> Nueva Orden
              </button>
            )}
            <button 
              onClick={fetchOrdenes} 
              className="bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              Actualizar
            </button>
          </div>
        </div>

        {/* KPIs INTERACTIVOS COMO FILTROS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <button 
            onClick={() => setFiltroEstado('todas')}
            className={`text-left bg-white p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
              filtroEstado === 'todas' ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-md' : 'border-slate-200/80 shadow-sm hover:border-slate-300'
            }`}
          >
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Órdenes Totales</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{ordenes.length}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><CarIcon /></div>
          </button>

          <button 
            onClick={() => setFiltroEstado('en_taller')}
            className={`text-left bg-white p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
              filtroEstado === 'en_taller' ? 'border-sky-600 ring-2 ring-sky-600/20 shadow-md' : 'border-slate-200/80 shadow-sm hover:border-slate-300'
            }`}
          >
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">En Taller</p>
              <p className="text-2xl font-black text-sky-600 mt-1">{enProceso}</p>
            </div>
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl"><WrenchIcon className="h-5 w-5" /></div>
          </button>

          <button 
            onClick={() => setFiltroEstado('finalizadas')}
            className={`text-left bg-white p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
              filtroEstado === 'finalizadas' ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md' : 'border-slate-200/80 shadow-sm hover:border-slate-300'
            }`}
          >
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Listos / Entregados</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{finalizadas}</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircleIcon className="h-5 w-5" /></div>
          </button>
        </div>

        {/* Listado Filtrado */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : ordenesFiltradas.length === 0 ? (
          <div className="bg-white p-14 text-center rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center">
            <div className="p-4 bg-slate-100 text-slate-400 rounded-2xl mb-4">
              <CarIcon className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No hay órdenes en esta categoría</h3>
            <p className="text-sm text-slate-500 max-w-md mt-1">
              Selecciona otro filtro en las tarjetas superiores o registra una nueva orden de servicio.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {ordenesFiltradas.map((orden) => {
              const isExpanded = ordenExpandida === orden.id;
              const siguientePaso = getSiguientePasoInfo(orden.estado);

              return (
                <div 
                  key={orden.id} 
                  onClick={() => setOrdenExpandida(isExpanded ? null : orden.id)}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="p-6 flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-slate-900 text-blue-400 rounded-xl shrink-0">
                        <CarIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">{orden.vehiculo_placa || `Vehículo #${orden.vehiculo}`}</h3>
                          <span className="text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
                            Orden #{orden.id}
                          </span>
                          <span className="text-xs font-medium text-slate-400">
                            • Clic para {isExpanded ? 'ocultar' : 'ver'} ficha técnica
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1.5">
                          <span className="font-semibold text-slate-800">Diagnóstico:</span> {orden.diagnostico_inicial}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-xl text-left sm:text-right shrink-0 w-full sm:w-auto">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {orden.estado === 'finalizado' ? 'Costo Final Liquidado' : 'Presupuesto Estimado'}
                      </span>
                      <span className="text-xl font-black text-slate-900">${Number(orden.costo_estimado || 0).toLocaleString('es-CO')}</span>
                    </div>
                  </div>

                  {/* FICHA DETALLADA DESPLEGABLE */}
                  {isExpanded && (
                    <div className="px-6 py-4 bg-slate-50/90 border-b border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                        <span className="text-slate-400 font-bold uppercase block mb-1">Vehículo</span>
                        <span className="text-slate-800 font-bold text-sm">{orden.vehiculo_info || orden.vehiculo_placa}</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                        <span className="text-slate-400 font-bold uppercase block mb-1">Propietario (Cliente)</span>
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold text-sm">
                          <UserIcon /> {formatNombre(orden.propietario_nombre)}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                        <span className="text-slate-400 font-bold uppercase block mb-1">Técnico Responsable</span>
                        <div className="flex items-center gap-1.5 text-blue-700 font-bold text-sm">
                          <WrenchIcon /> {formatNombre(orden.mecanico_nombre)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Barra de Trazabilidad */}
                  <div className="p-6">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Progreso del Servicio</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                      <div className={`py-2.5 px-2 rounded-xl border transition-all ${getStepClass(orden.estado, 'recibido')}`}>1. Recibido</div>
                      <div className={`py-2.5 px-2 rounded-xl border transition-all ${getStepClass(orden.estado, 'diagnostico')}`}>2. Diagnóstico</div>
                      <div className={`py-2.5 px-2 rounded-xl border transition-all ${getStepClass(orden.estado, 'reparacion')}`}>3. En Reparación</div>
                      <div className={`py-2.5 px-2 rounded-xl border transition-all ${getStepClass(orden.estado, 'finalizado')}`}>4. Listo</div>
                    </div>
                  </div>

                  {/* PIE DE TARJETA: Diferenciado por Rol */}
                  {userRol === 'admin' && (
                    <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Mecánico a cargo: <strong className="text-slate-800">{formatNombre(orden.mecanico_nombre)}</strong></span>
                      <span>Propietario: <strong className="text-slate-800">{formatNombre(orden.propietario_nombre)}</strong></span>
                    </div>
                  )}

                  {userRol === 'mecanico' && siguientePaso && (
                    <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-500">Siguiente paso operativo:</span>
                      <button 
                        onClick={(e) => abrirModalAvance(e, orden)} 
                        className={`text-xs px-4 py-2 rounded-xl font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                          siguientePaso.codigo === 'finalizado' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {siguientePaso.codigo === 'finalizado' ? <CheckCircleIcon /> : <WrenchIcon />}
                        {siguientePaso.texto}
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL 1: CREAR NUEVA ORDEN (SOLO ADMIN) */}
      {showModalCrear && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-black text-slate-900">Registrar Nueva Orden</h3>
              <button onClick={() => setShowModalCrear(false)} className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCrearOrden} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Vehículo (Placa)</label>
                <select 
                  value={vehiculoId} 
                  onChange={(e) => setVehiculoId(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
                  required
                >
                  <option value="">Selecciona un vehículo...</option>
                  {vehiculos.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.placa} — {v.marca} {v.modelo} ({v.anio})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Diagnóstico Inicial</label>
                <textarea 
                  rows="3"
                  placeholder="Describe la falla reportada o el mantenimiento..."
                  value={diagnostico} 
                  onChange={(e) => setDiagnostico(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Presupuesto Estimado (COP)</label>
                <input 
                  type="number" 
                  placeholder="Ej. 250000"
                  value={costoEstimado} 
                  onChange={(e) => setCostoEstimado(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModalCrear(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={creando} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl shadow-md cursor-pointer">
                  {creando ? 'Guardando...' : 'Crear Orden'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VALIDACIÓN DE AVANCE / LIQUIDACIÓN (SOLO MECÁNICO) */}
      {ordenParaAvanzar && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-slate-900">
                {siguienteFase === 'finalizado' ? 'Liquidar y Finalizar Orden' : 'Registrar Avance Técnico'}
              </h3>
              <button onClick={() => setOrdenParaAvanzar(null)} className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer">✕</button>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Vehículo <strong>{ordenParaAvanzar.vehiculo_placa}</strong> • Pasando a fase: <strong className="uppercase text-blue-600">{siguienteFase}</strong>
            </p>

            <form onSubmit={confirmarAvanceFase} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Observación Técnica / Bitácora (Obligatorio)
                </label>
                <textarea 
                  rows="3"
                  placeholder="Detalla los hallazgos, repuestos cambiados o pruebas realizadas..."
                  value={observacionTecnica} 
                  onChange={(e) => setObservacionTecnica(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              {siguienteFase === 'finalizado' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Costo Real Final a Cobrar (COP)
                  </label>
                  <input 
                    type="number" 
                    value={costoFinalReal} 
                    onChange={(e) => setCostoFinalReal(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOrdenParaAvanzar(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl cursor-pointer">
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={actualizando} 
                  className={`flex-1 text-white font-bold text-xs py-3 rounded-xl shadow-md cursor-pointer ${
                    siguienteFase === 'finalizado' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {actualizando ? 'Guardando...' : 'Confirmar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}