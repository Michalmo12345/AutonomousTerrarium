import { Form, Row, Col, Button } from 'react-bootstrap';
import { useState } from 'react';

export default function AutomaticSettingsPanel({ terrarium, onUpdate }) {
  const [form, setForm] = useState({
    day_temperature:   terrarium.day_temperature,
    night_temperature: terrarium.night_temperature,
    day_humidity:      terrarium.humidity,
    night_humidity:    terrarium.humidity,
    leds_enabled:      terrarium.leds_enabled,
    color:             terrarium.color,
  });

  const handleChange = e => {
    const { name, type, value, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : parseFloat(value)
    }));
  };

  const save = () => {
    const temperature = terrarium.day ? form.day_temperature : form.night_temperature;
    const humidity    = terrarium.day ? form.day_humidity    : form.night_humidity;
    onUpdate({ temperature, humidity });
    onUpdate({ leds_enabled: form.leds_enabled });
    onUpdate({ color:          form.color });
  };

  return (
    <Form className="g-3">
      <Row>
        <Form.Group as={Col} controlId="dayTemp">
          <Form.Label>Day Temp (°C)</Form.Label>
          <Form.Control
            type="number" step="0.1"
            name="day_temperature"
            value={form.day_temperature}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="dayHum">
          <Form.Label>Day Humidity (%)</Form.Label>
          <Form.Control
            type="number" step="0.1"
            name="day_humidity"
            value={form.day_humidity}
            onChange={handleChange}
          />
        </Form.Group>
      </Row>
      <Row>
        <Form.Group as={Col} controlId="nightTemp">
          <Form.Label>Night Temp (°C)</Form.Label>
          <Form.Control
            type="number" step="0.1"
            name="night_temperature"
            value={form.night_temperature}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="nightHum">
          <Form.Label>Night Humidity (%)</Form.Label>
          <Form.Control
            type="number" step="0.1"
            name="night_humidity"
            value={form.night_humidity}
            onChange={handleChange}
          />
        </Form.Group>
      </Row>
      <Form.Check
        type="switch"
        id="auto-led-switch"
        label="LEDs On in Auto"
        name="leds_enabled"
        checked={form.leds_enabled}
        onChange={handleChange}
        className="my-3"
      />
      <Form.Check
        type="switch"
        id="color-mode-switch"
        label="Color Mode"
        name="color"
        checked={form.color}
        onChange={handleChange}
        className="mb-3"
      />
      <Button variant="success" className="w-100" onClick={save}>
        Save Settings
      </Button>
    </Form>
  );
}
