import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../store/useStore';

export default function Charts() {
  const { speed, score } = useStore((state) => state.hardwareState);
  const [data, setData] = useState([]);

  useEffect(() => {
    setData((prev) => {
      const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" });
      const newData = [...prev, { time: now, speed, score }];
      if (newData.length > 20) newData.shift();
      return newData;
    });
  }, [speed, score]);

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Telemetry Stream</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" tick={{fill: '#94a3b8', fontSize: 10}} />
            <YAxis yAxisId="left" stroke="rgba(255,255,255,0.3)" tick={{fill: '#94a3b8', fontSize: 10}} />
            <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.3)" tick={{fill: '#94a3b8', fontSize: 10}} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
              itemStyle={{ fontSize: '12px' }}
              labelStyle={{ color: '#94a3b8', fontSize: '10px' }}
            />
            <Line yAxisId="left" type="monotone" dataKey="speed" stroke="#38BDF8" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Speed (km/h)"/>
            <Line yAxisId="right" type="monotone" dataKey="score" stroke="#10B981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Safety Score"/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
