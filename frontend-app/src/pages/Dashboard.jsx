import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import MetricCard from '../components/MetricCard';
import ChartCard from '../components/ChartCard';
import { Settings, Droplets, ArrowUpRight, Clock, Box, Activity } from 'lucide-react';

export default function Dashboard() {
  const [latestData, setLatestData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [availableKeys, setAvailableKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  // Funciones de fetch hacia el Proxy (Node.js)
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Include JWT token automatically inside App or Auth layer, or manually here
        const token = localStorage.getItem('jwt_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // 1. Obtener ultimo registro
        const resLatest = await fetch('/api/data/latest', { headers });
        const jsonLatest = await resLatest.json();
        
        let lastTimestamp = null;
        if (jsonLatest.ok && jsonLatest.data && jsonLatest.data.length > 0) {
          const row = jsonLatest.data[0];
          setLatestData(row);
          lastTimestamp = row.timestamp_completo || row.time;
          
          // Extraer nombres de las variables que viven dentro del subobjeto 'data'
          const metricsObj = row.data || {};
          const keys = Object.keys(metricsObj);
          setAvailableKeys(keys);
        }

        // 2. Obtener historico usando el time del ultimo registro como referencia
        let urlPreset = '/api/data/preset?preset=365d';
        if (lastTimestamp) {
            urlPreset += `&base_date=${encodeURIComponent(lastTimestamp)}`;
        }

        const resHist = await fetch(urlPreset, { headers });
        const jsonHist = await resHist.json();

        if (jsonHist.ok && jsonHist.data) {
          // Revertir el array (pasado a presente) y aplanar la estructura del JSON para que Recharts la entienda
          const flatData = jsonHist.data.map(row => ({
            time: row.timestamp_completo || row.time,
            ...(row.data || {})
          })).reverse();
          
          setHistoricalData(flatData);
        }

      } catch (err) {
        console.error("Error cargando datos de API:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    
    // Configurar sondeo cada 15 segundos
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <Sidebar />
      
      {/* Contenido principal con margen para el Sidebar fijo */}
      <main className="flex-1 ml-64 flex flex-col">
        {/* Topbar blanca */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Box className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Dashboard Dinámico</h1>
              <p className="text-sm text-slate-500">
                {loading ? 'Sincronizando...' : `Última actualización: ${new Date().toLocaleTimeString('es-ES')}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Sistema en línea
            </div>
          </div>
        </header>

        {/* Tablero (Grid de Widgets) */}
        <div className="p-8 max-w-[1600px] w-full mx-auto">
          
          {/* Fila 1: KPIs numéricos (Tarjetas) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {availableKeys.map((key, index) => {
               const value = latestData && latestData.data ? latestData.data[key] : undefined;
               const time = latestData ? (latestData.timestamp_completo || latestData.time) : undefined;
               // Alternamos iconos para la demo
               const icons = [Droplets, Activity, Settings, Clock];
               const IconSelected = icons[index % icons.length];
               
               // Mapeo empresarial según tu foto:
               let displayTitle = `Métrica ${key}`;
               let displayUnit = "uds";
               if (key.toUpperCase().includes('REG1')) {
                 displayTitle = "Nivel Freático";
                 displayUnit = "m";
               } else if (key.toUpperCase().includes('CAUDAL') || key === 'REG2') {
                 displayTitle = "Caudal Instantáneo";
                 displayUnit = "L/s";
               }
               
               return (
                 <MetricCard 
                   key={key} 
                   title={displayTitle} 
                   value={value} 
                   unit={displayUnit} 
                   icon={IconSelected}
                   time={time}
                 />
               );
            })}
            
            {/* Si no hay datos, mostrar placeholders */}
            {availableKeys.length === 0 && !loading && (
              <div className="col-span-full border-2 border-dashed border-slate-300 rounded-xl p-12 text-center">
                <p className="text-slate-500 font-medium">No se encontraron variables en la API.</p>
                <p className="text-slate-400 text-sm mt-1">Asegurese de que csvprocessor está encendido.</p>
              </div>
            )}
          </div>

          {/* Fila 2: Gráficos de Área (ChartJS / Recharts) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {availableKeys.map((key, index) => {
                // Alternamos colores para las graficas
                const colors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];
                const color = colors[index % colors.length];

                // Mapeo empresarial para el gráfico:
                let displayTitleChart = `Histórico - ${key}`;
                if (key.toUpperCase().includes('REG1')) {
                  displayTitleChart = "Fluctuación del Nivel Freático";
                } else if (key.toUpperCase().includes('CAUDAL') || key === 'REG2') {
                  displayTitleChart = "Comportamiento del Caudal";
                }

                return (
                  <ChartCard 
                    key={key}
                    title={displayTitleChart}
                    data={historicalData}
                    dataKey={key}
                    color={color}
                  />
                );
             })}
          </div>

        </div>
      </main>
    </div>
  );
}
