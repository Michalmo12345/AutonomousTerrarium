import { Form, Button } from 'react-bootstrap';
import { useState } from 'react';
import axios from 'axios';

const BASE_URL = 'http://13.60.223.176:5000/api';

export default function AutomaticSettingsPanel({ terrarium, id, token, setTerrarium }) {
  const [form, setForm] = useState({ temperature: '', humidity: '' });
  const [error, setError] = useState('');

  const handleFieldChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

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
      setForm({ temperature: '', humidity: '' });
    } catch (error) {
      console.error('Failed to update:', error);
      setError(error.response?.data?.error || 'Failed to update terrarium');
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
          placeholder="Enter temperature"
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
          placeholder="Enter humidity"
          onChange={handleFieldChange}
        />
      </Form.Group>

      {error && <div className="text-danger mb-2">{error}</div>}

      <Button variant="primary" className="w-100 mb-3" onClick={saveTemperatureHumidity}>
        Save Temp & Humidity
      </Button>
    </Form>
  );
}
