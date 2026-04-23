import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Settings, Activity, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0">
      {/* Perfil del Usuario */}
      <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-100">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
          {user ? user.nombre.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="overflow-hidden">
          <p className="font-semibold text-sm text-slate-800 truncate">{user ? user.nombre : 'Usuario'}</p>
          <p className="text-xs text-slate-500">{user ? user.tipo : 'Rol'}</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
        <Link
          to="/companies"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive('/companies')
              ? 'bg-teal-50 text-teal-700'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-5 h-5" />
          Empresas
        </Link>
        
        <Link
          to="/dashboard"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive('/dashboard')
              ? 'bg-teal-50 text-teal-700'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 space-y-1">
        <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
          <Settings className="w-4 h-4" />
          <span className="text-sm">Configuración</span>
        </a>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors font-medium text-left"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
