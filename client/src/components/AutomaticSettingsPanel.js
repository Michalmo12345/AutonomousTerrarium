import { Form, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';

export default function AutomaticSettingsPanel({ terrarium, onUpdate }) {
  // unified state: temperature and humidity, plus LEDs and color
  const [form, setForm] = useState({
    temperature: terrarium.temperature,
    humidity:    terrarium.humidity,
    leds_enabled: terrarium.leds_enabled,
    color:        terrarium.color,
  });

  useEffect(() => {
    // sync when terrarium props change
    setForm({
      temperature: terrarium.temperature,
      humidity:    terrarium.humidity,
      leds_enabled: terrarium.leds_enabled,
      color:        terrarium.color,
    });
  }, [terrarium]);

  const handleChange = e => {
    const { name, type, value, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
    }));
  };

  const save = () => {
    onUpdate({
      temperature:  form.temperature,
      humidity:     form.humidity,
      leds_enabled: form.leds_enabled,
      color:        Number(form.color),
    });
  };

  return (
    <Form className="g-3">
      <Form.Group controlId="autoTemp" className="mb-3">
        <Form.Label>
          {terrarium.day ? 'Day Temperature (°C)' : 'Night Temperature (°C)'}
        </Form.Label>
        <Form.Control
          type="number"
          step="0.1"
          name="temperature"
          value={form.temperature}
          onChange={handleChange}
          placeholder="Enter temperature"
        />
      </Form.Group>

      <Form.Group controlId="autoHum" className="mb-3">
        <Form.Label>Humidity (%)</Form.Label>
        <Form.Control
          type="number"
          step="0.1"
          name="humidity"
          value={form.humidity}
          onChange={handleChange}
          placeholder="Enter humidity"
        />
      </Form.Group>

      <Form.Check
        type="switch"
        id="auto-led-switch"
        label="LEDs"
        name="leds_enabled"
        checked={form.leds_enabled}
        onChange={handleChange}
        className="mb-3"
      />

      <Form.Group controlId="autoColor" className="mb-3">
        <Form.Label>Color (integer)</Form.Label>
        <Form.Control
          type="number"
          name="color"
          value={form.color}
          onChange={handleChange}
          placeholder="Enter color code"
        />
      </Form.Group>

      <Button variant="success" className="w-100" onClick={save}>
        Save Settings
      </Button>
    </Form>
  );
}
