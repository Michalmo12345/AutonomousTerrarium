import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function ReadingChart({ readings }) {
  // map to last 10 readings, reverse for chronological order
  const data = readings.slice(0,10).reverse().map(r => ({
    time: new Date(r.created_at).toLocaleTimeString(),
    temperature: Number(r.temperature),
    humidity:    Number(r.humidity),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
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
  );
}