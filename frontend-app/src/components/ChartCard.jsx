import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { CalendarDays, MoreVertical } from 'lucide-react';

export default function ChartCard({ title, data, dataKey, color = "#6366f1" }) {
  
  // Custom tooltip to make it look premium
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg">
          <p className="text-sm font-semibold text-slate-800 mb-1">
            {format(parseISO(label), 'dd/MM/yyyy HH:mm')}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-bold" style={{ color: entry.color }}>
              {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md flex items-center justify-center text-white" style={{ backgroundColor: color }}>
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-700">{title}</h3>
            <p className="text-xs text-slate-400">Últimos datos (Preset)</p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 w-full h-full relative">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="time" 
                tickFormatter={(timeStr) => {
                  try { return format(parseISO(timeStr), 'HH:mm'); } catch { return timeStr; }
                }} 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}} 
                minTickGap={30}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} fillOpacity={1} fill={`url(#color${dataKey})`} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-300 animate-ping"></span>
              Esperando datos...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
