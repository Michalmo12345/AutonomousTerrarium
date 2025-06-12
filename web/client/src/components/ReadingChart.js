import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function ReadingChart({ readings }) {
  // Prepare chart data (last 10 readings, chronological order)
  const data = readings.slice(0, 10).reverse().map(r => ({
    time: new Date(r.created_at).toLocaleTimeString(),
    temperature: Number(r.temperature),
    humidity: Number(r.humidity),
  }));

  // Compute alarm condition based on latest reading timestamp
  const latestReading = readings[0] || null;
  const now = Date.now();
  const lastTime = latestReading ? new Date(latestReading.created_at).getTime() : 0;
  const ageMs = now - lastTime;
  const isStale = ageMs > 60 * 1000;
  const ageSec = Math.floor(ageMs / 1000);

  return (
    <div style={{ position: 'relative', width: '100%', height: 300 }}>
      {/* Alarm overlay */}
      {isStale && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 0, 0, 0.9)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            borderRadius: '4px'
          }}
        >
          <h1 style={{ fontSize: '3rem', margin: 0 }}>⚠️ NO RECENT READINGS ⚠️</h1>
          <p style={{ fontSize: '1.25rem', margin: '0.5rem 0 0' }}>Last reading was {ageSec}s ago</p>
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <XAxis dataKey="time" />
          <YAxis yAxisId="left" orientation="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#8884d8" dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#82ca9d" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
