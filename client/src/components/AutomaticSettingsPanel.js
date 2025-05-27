import { Form, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import axios from 'axios';
const [error, setError] = useState('');

const BASE_URL = 'http://13.60.201.150:5000/api';

export default function AutomaticSettingsPanel({ terrarium, id, token, setTerrarium }) {
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
    const { data } = await axios.put(
      `${BASE_URL}/terrariums/${id}/color`,
      { color: form.color },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setTerrarium(prev => ({ ...prev, color: data.color }));
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

      <Form.Check
        type="switch"
        id="auto-led-switch"
        label="LEDs"
        name="leds_enabled"
        checked={form.leds_enabled}
        onChange={() => setForm(f => ({ ...f, leds_enabled: !f.leds_enabled }))}
        className="mb-3"
      />

      <Form.Group controlId="autoColor" className="mb-3">
        <Form.Label>Color (integer)</Form.Label>
        <Form.Control
          type="number"
          name="color"
          value={form.color}
          onChange={handleFieldChange}
        />
      </Form.Group>
      <Button variant="primary" className="w-100" onClick={saveColor}>
        Save Color
      </Button>
    </Form>
  );
}
