import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Droplets, Droplet, Users, Settings, Activity, LogOut, FileText } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <Activity className="text-blue-500 w-8 h-8" />
        <span className="font-bold text-xl text-slate-800 tracking-tight">Monitoreo</span>
      </div>
      
      <div className="p-6 border-b border-slate-100 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
          {user ? user.nombre.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="overflow-hidden">
          <p className="font-semibold text-sm text-slate-800 truncate">{user ? user.nombre : 'Usuario'}</p>
          <p className="text-xs text-slate-500 font-medium">{user ? user.tipo : 'Operaciones'}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-1">
        <div className="text-xs font-bold text-slate-400 uppercase mb-2 px-2">Principal</div>
        
        <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-blue-600 font-medium">
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>
        
        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
          <Droplets className="w-5 h-5" />
          Consumo de Agua
        </a>
        
        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
          <Droplet className="w-5 h-5" />
          Niveles
        </a>

        {user && (user.tipo === 'Admin' || user.tipo === 'SuperAdmin') && (
          <div className="mt-8">
            <div className="text-xs font-bold text-slate-400 uppercase mb-2 px-2">Administración</div>
            
            <Link to="/users" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <Users className="w-5 h-5" />
              Gestión de Usuarios
            </Link>
            
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <FileText className="w-5 h-5" />
              Reportes
            </a>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors mb-1">
          <Settings className="w-5 h-5" />
          <span className="text-sm">Configuración</span>
        </a>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors font-medium text-left"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
