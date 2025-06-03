import { Form, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'http://13.51.108.48:5000/api';

const COLORS = [
  { name: 'Off',    value: 0 },
  { name: 'Green',  value: 1 },
  { name: 'Red',    value: 2 },
  { name: 'Blue',   value: 3 },
  { name: 'Yellow', value: 4 },
  { name: 'Purple', value: 5 },
  { name: 'Cyan',   value: 6 },
  { name: 'White',  value: 7 },
  { name: 'Orange', value: 8 },
];

export default function AutomaticSettingsPanel({ terrarium, id, token, setTerrarium }) {
  const [color, setColor] = useState(terrarium.color);
  const [form, setForm] = useState({
    temperature:  terrarium.temperature,
    humidity:     terrarium.humidity,
    leds_enabled: terrarium.leds_enabled,
    color:        terrarium.color,
  });

  useEffect(() => {
    setForm({
      temperature:  terrarium.temperature,
      humidity:     terrarium.humidity,
      leds_enabled: terrarium.leds_enabled,
      color:        terrarium.color,
    });
  }, [terrarium]);

  const handleFieldChange = e => {
    const { name, type, value, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : parseFloat(value)
    }));
  };
  const [error, setError] = useState('');
  const saveTemperatureHumidity = async () => {
    const temperature = Number(form.temperature);
    const humidity = Number(form.humidity);
  
    if (
      Number.isNaN(temperature) || Number.isNaN(humidity) ||
      temperature <= 0 || temperature >= 100 ||
      humidity <= 0 || humidity >= 100
    ) {
      setError('Temperature and humidity must be numbers between 0 and 100');
      return;
    }
  
    try {
      const { data } = await axios.put(
        `${BASE_URL}/terrariums/${id}`,
        { temperature, humidity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTerrarium(prev => ({ ...prev, ...data }));
      setError('');
    } catch (error) {
      console.error('Failed to update:', error);
      setError(error.response?.data?.error || 'Failed to update terrarium');
    }
  };

  const saveColor = async () => {
    try {
      const { data } = await axios.put(
        `${BASE_URL}/terrariums/${terrarium.id}/color`,
        { color: color }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTerrarium(prev => ({ ...prev, color: data.color }));
    } catch (err) {
      console.error('Save color failed:', err);
    }
  };

  return (
    <Form className="g-3">
      <Form.Group controlId="autoTemp" className="mb-3">
        <Form.Label>{terrarium.day ? 'Day Temperature (°C)' : 'Night Temperature (°C)'}</Form.Label>
        <Form.Control
          type="number"
          step="0.1"
          name="temperature"
          value={form.temperature}
          onChange={handleFieldChange}
        />
      </Form.Group>

      <Form.Group controlId="autoHum" className="mb-3">
        <Form.Label>Humidity (%)</Form.Label>
        <Form.Control
          type="number"
          step="0.1"
          name="humidity"
          value={form.humidity}
          onChange={handleFieldChange}
        />
      </Form.Group>

      <Button variant="primary" className="w-100 mb-3" onClick={saveTemperatureHumidity}>
        Save Temp & Humidity
      </Button>
    </Form>
  );
}
