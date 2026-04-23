import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import {
  Building2, Search, ChevronRight, MapPin, Clock,
  Activity, Settings, LogOut, Users, LayoutDashboard,
  ChevronLeft, Wifi, WifiOff, Calendar, FileText,
  UserPlus, Mail, AlertCircle, CheckCircle
} from 'lucide-react';
import axios from 'axios';

export default function CompaniesView() {
  const { user, logout } = useContext(AuthContext);
  const [companies, setCompanies] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('instalaciones');
  const location = useLocation();

  // ─── Estado para Gestión de Usuarios (integrado) ───
  const [empresas, setEmpresas] = useState([]);
  const [userFormLoading, setUserFormLoading] = useState(false);
  const [userStatus, setUserStatus] = useState({ type: '', msg: '' });
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    cargo: '',
    tipo: 'Cliente',
    empresa_id: '',
    sub_empresa_id: ''
  });

  // Cargar lista de empresas
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const token = localStorage.getItem('jwt_token');
        const res = await fetch('/api/companies', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.ok && json.data) {
          setCompanies(json.data);
          // Seleccionar la primera empresa por defecto
          if (json.data.length > 0) {
            setSelectedCompany(json.data[0]);
          }
        }
      } catch (err) {
        console.error('Error cargando empresas:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanies();
  }, []);

  // Cargar sitios cuando cambia la empresa seleccionada
  useEffect(() => {
    if (!selectedCompany) return;
    async function fetchSites() {
      try {
        const token = localStorage.getItem('jwt_token');
        const res = await fetch(`/api/companies/${selectedCompany.id}/sites`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.ok && json.data) {
          setSites(json.data);
        }
      } catch (err) {
        console.error('Error cargando sitios:', err);
      }
    }
    fetchSites();
  }, [selectedCompany]);

  // Cargar empresas para el formulario de usuarios
  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const token = localStorage.getItem('jwt_token');
        const res = await axios.get('/api/users/empresas', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.ok) setEmpresas(res.data.data);
      } catch (err) {
        console.error("Error al cargar empresas", err);
      }
    };
    fetchEmpresas();
  }, []);

  // Filtrar empresas por búsqueda
  const filteredCompanies = companies.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handler del formulario de usuarios
  const handleUserChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setUserFormLoading(true);
    setUserStatus({ type: '', msg: '' });

    try {
      const token = localStorage.getItem('jwt_token');
      const res = await axios.post('/api/users', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.ok) {
        setUserStatus({ type: 'success', msg: res.data.message });
        setFormData({ ...formData, nombre: '', apellido: '', email: '', telefono: '', cargo: '' });
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setUserStatus({ type: 'error', msg: err.response.data.error });
      } else {
        setUserStatus({ type: 'error', msg: "Error al crear el usuario." });
      }
    } finally {
      setUserFormLoading(false);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">

      {/* ═══════════════════════════════════════════════════════════════
          SIDEBAR LIMPIO
          ═══════════════════════════════════════════════════════════════ */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 transition-all duration-300 z-30`}>

        {/* Perfil del Usuario + Logo */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
              {user ? user.nombre.charAt(0).toUpperCase() : 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <p className="font-semibold text-sm text-slate-800 truncate">{user ? user.nombre : 'Usuario'}</p>
                <p className="text-xs text-slate-500">{user ? user.tipo : 'Rol'}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navegación Principal - Solo Dashboard y Companies */}
        <nav className="px-3 py-3">
          <Link
            to="/companies"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/companies'
                ? 'bg-teal-50 text-teal-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && 'Empresas'}
          </Link>

          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/dashboard'
                ? 'bg-teal-50 text-teal-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && 'Dashboard'}
          </Link>
        </nav>

        {/* Lista de Empresas */}
        {!sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto px-3 py-2 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 pt-2">Empresas</p>

            {/* Buscador */}
            <div className="relative mb-3 px-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 outline-none transition-all"
              />
            </div>

            {/* Lista de Empresas */}
            <div className="space-y-0.5">
              {filteredCompanies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => { setSelectedCompany(company); setActiveTab('instalaciones'); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                    selectedCompany?.id === company.id
                      ? 'bg-teal-50 text-teal-700 font-semibold border border-teal-200'
                      : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  {company.nombre}
                </button>
              ))}
              {filteredCompanies.length === 0 && !loading && (
                <p className="text-xs text-slate-400 px-3 py-2">Sin resultados</p>
              )}
            </div>
          </div>
        )}

        {/* Footer del Sidebar */}
        <div className="p-3 border-t border-slate-100 mt-auto space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors text-sm">
            <Settings className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && 'Configuración'}
          </a>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && 'Cerrar Sesión'}
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════
          CONTENIDO PRINCIPAL
          ═══════════════════════════════════════════════════════════════ */}
      <main className={`flex-1 ${sidebarCollapsed ? 'ml-20' : 'ml-72'} transition-all duration-300`}>

        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-teal-50 rounded-lg">
              <Building2 className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                {selectedCompany ? selectedCompany.nombre : 'Selecciona una empresa'}
              </h1>
              <p className="text-sm text-slate-500">
                {sites.length} {sites.length === 1 ? 'Instalación' : 'Instalaciones'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedCompany && (
              <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 border border-amber-100">
                <Calendar className="w-3.5 h-3.5" />
                Venc. Contrato: 1 de Marzo
              </div>
            )}
            <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              WIP
            </div>
          </div>
        </header>

        {/* Tabs de Navegación - Ahora incluye Usuarios */}
        {selectedCompany && (
          <div className="bg-white border-b border-slate-200 px-8">
            <div className="flex gap-1">
              {[
                { key: 'general', label: 'General' },
                { key: 'instalaciones', label: 'Instalaciones' },
                { key: 'contactos', label: 'Contactos' },
                ...(user && (user.tipo === 'Admin' || user.tipo === 'SuperAdmin')
                  ? [{ key: 'usuarios', label: 'Usuarios' }]
                  : [])
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-teal-500 text-teal-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tab.key === 'usuarios' && <Users className="w-4 h-4 inline mr-1.5 -mt-0.5" />}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Contenido según pestaña activa */}
        <div className="p-8">

          {/* ─── Tab: Instalaciones ─── */}
          {activeTab === 'instalaciones' && (
            <>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                </div>
              ) : sites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {sites.map((site) => (
                    <div
                      key={site.id}
                      className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-slate-300 transition-all duration-200 cursor-pointer group"
                    >
                      {/* Header de la Tarjeta */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-teal-50 transition-colors">
                            <MapPin className="w-5 h-5 text-slate-500 group-hover:text-teal-600 transition-colors" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-slate-800">{site.descripcion}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">{site.ubicacion || 'Legacy'}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                      </div>

                      {/* Footer de la Tarjeta */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-xs text-slate-500">Post</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs text-slate-400">Último dato</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedCompany ? (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-16 text-center">
                  <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No hay instalaciones registradas</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Agrega sitios a <strong>{selectedCompany.nombre}</strong> desde la base de datos.
                  </p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-16 text-center">
                  <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Selecciona una empresa del panel izquierdo</p>
                </div>
              )}
            </>
          )}

          {/* ─── Tab: General ─── */}
          {activeTab === 'general' && selectedCompany && (
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Información General</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Nombre</p>
                  <p className="text-sm text-slate-800 font-medium">{selectedCompany.nombre}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase">ID</p>
                  <p className="text-sm text-slate-800 font-medium">{selectedCompany.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Tipo</p>
                  <p className="text-sm text-slate-800 font-medium">{selectedCompany.tipo_empresa || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Instalaciones</p>
                  <p className="text-sm text-slate-800 font-medium">{sites.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* ─── Tab: Contactos ─── */}
          {activeTab === 'contactos' && selectedCompany && (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-16 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Contactos próximamente</p>
              <p className="text-sm text-slate-400 mt-1">Esta sección estará disponible pronto.</p>
            </div>
          )}

          {/* ─── Tab: Usuarios (Gestión integrada) ─── */}
          {activeTab === 'usuarios' && user && (user.tipo === 'Admin' || user.tipo === 'SuperAdmin') && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
                
                <div className="flex items-center gap-3 mb-6">
                  <Mail className="text-teal-500 w-6 h-6" />
                  <h2 className="text-lg font-bold text-slate-800">Invitar a un Evaluador o Cliente</h2>
                </div>
                
                <p className="text-sm text-slate-500 mb-8 border-l-4 border-teal-500 pl-4 py-1 bg-teal-50/50 rounded-r-lg">
                  Al invitar a un usuario, el sistema <strong>generará y enviará automáticamente una clave inicial</strong> de 8 caracteres al correo que indiques.
                </p>

                {userStatus.msg && (
                  <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 font-medium transition-all ${userStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                    {userStatus.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
                    <span>{userStatus.msg}</span>
                  </div>
                )}

                <form onSubmit={handleUserSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Nombre */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Nombre *</label>
                      <input required name="nombre" value={formData.nombre} onChange={handleUserChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors" placeholder="Ej. Roberto" />
                    </div>

                    {/* Apellido */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Apellido *</label>
                      <input required name="apellido" value={formData.apellido} onChange={handleUserChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors" placeholder="Ej. Sánchez" />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-700">Correo Electrónico * (Destino de la clave)</label>
                      <input required type="email" name="email" value={formData.email} onChange={handleUserChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors" placeholder="roberto@empresa.com" />
                    </div>

                    {/* Rol */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Nivel de Acceso (Rol) *</label>
                      <select required name="tipo" value={formData.tipo} onChange={handleUserChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors text-slate-800 font-medium">
                        <option value="Cliente">Cliente (Lectura)</option>
                        <option value="Gerente">Gerente (Supervisa Sub-Empresa)</option>
                        {user?.tipo === 'SuperAdmin' && <option value="Admin">Admin (Dueño Empresa Padre)</option>}
                      </select>
                    </div>

                    {/* Empresa */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Empresa Padre Asignada *</label>
                      <select required name="empresa_id" value={formData.empresa_id} onChange={(e) => setFormData({...formData, empresa_id: e.target.value, sub_empresa_id: ''})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors text-slate-800">
                        <option value="" disabled>-- Selecciona una Empresa --</option>
                        {empresas.map(e => (
                          <option key={e.id} value={e.id}>{e.nombre} ({e.tipo_empresa})</option>
                        ))}
                      </select>
                    </div>

                    {/* Sub Empresa (Condicional) */}
                    {(formData.tipo === 'Gerente' || (formData.tipo === 'Cliente' && formData.empresa_id)) && (
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Sub Empresa / Faena {formData.tipo === 'Gerente' ? '*' : '(Opcional para Clientes)'}
                        </label>
                        <select 
                          name="sub_empresa_id" 
                          value={formData.sub_empresa_id} 
                          onChange={handleUserChange} 
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors text-slate-800"
                          required={formData.tipo === 'Gerente'}
                        >
                          <option value="">-- {formData.tipo === 'Gerente' ? 'Debes seleccionar una sucursal' : 'Toda la Empresa Padre'} --</option>
                          {empresas.find(e => e.id === formData.empresa_id)?.sub_empresas?.map(se => (
                            <option key={se.id} value={se.id}>{se.nombre}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Opcionales */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Teléfono Auxiliar</label>
                      <input name="telefono" value={formData.telefono} onChange={handleUserChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors" placeholder="+56 9 ..." />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Cargo</label>
                      <input name="cargo" value={formData.cargo} onChange={handleUserChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors" placeholder="Ej. Supervisor de Planta" />
                    </div>

                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button type="submit" disabled={userFormLoading} className={`px-6 py-3 rounded-xl text-white font-bold transition-all shadow-md ${userFormLoading ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 hover:shadow-lg active:scale-95'}`}>
                      {userFormLoading ? 'Generando Contraseña...' : 'Invitar y Enviar Correo'}
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
