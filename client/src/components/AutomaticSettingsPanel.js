import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

export default function AutomaticSettingsPanel({ terrarium, onUpdate }) {
  // initial values based on day/night DB columns
  const [form, setForm] = useState({
    day_temperature: terrarium.day_temperature,
    night_temperature: terrarium.night_temperature,
    day_humidity_target: terrarium.day_humidity_target,
    night_humidity_target: terrarium.night_humidity_target,
    color: terrarium.color,
    leds_enabled: terrarium.leds_enabled,
  });

  const handleChange = e => {
    const { name, type, value, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseFloat(value),
    }));
  };

  const save = () => {
    onUpdate(form);
  };

  return (
    <Form className="space-y-3">
      <Form.Group>
        <Form.Label>Day Temp (°C)</Form.Label>
        <Form.Control
          type="number" step="0.1"
          name="day_temperature"
          value={form.day_temperature}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Night Temp (°C)</Form.Label>
        <Form.Control
          type="number" step="0.1"
          name="night_temperature"
          value={form.night_temperature}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Day Humidity (%)</Form.Label>
        <Form.Control
          type="number" step="0.1"
          name="day_humidity_target"
          value={form.day_humidity_target}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Night Humidity (%)</Form.Label>
        <Form.Control
          type="number" step="0.1"
          name="night_humidity_target"
          value={form.night_humidity_target}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="form-check">
        <Form.Check
          type="checkbox"
          label="LEDs On in Automatic"
          name="leds_enabled"
          checked={form.leds_enabled}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="form-check">
        <Form.Check
          type="checkbox"
          label="Color Mode"
          name="color"
          checked={form.color}
          onChange={handleChange}
        />
      </Form.Group>

      <Button onClick={save}>Save Settings</Button>
    </Form>
  );
}
