import { Form, Row, Col, Button } from 'react-bootstrap';
import { useState } from 'react';

export default function AutomaticSettingsPanel({ terrarium, onUpdate }) {
  const [form, setForm] = useState({
    day_temperature:        terrarium.day_temperature,
    night_temperature:      terrarium.night_temperature,
    day_humidity_target:    terrarium.day_humidity_target,
    night_humidity_target:  terrarium.night_humidity_target,
    leds_enabled:           terrarium.leds_enabled,
    color:                  terrarium.color,
  });

  const handleChange = e => {
    const { name, type, value, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : parseFloat(value)
    }));
  };

  const save = () => {
    // unify into temperature/humidity depending on day flag:
    const temperature = terrarium.day
      ? form.day_temperature
      : form.night_temperature;
    const humidity = terrarium.day
      ? form.day_humidity_target
      : form.night_humidity_target;

    onUpdate({ 
      temperature, 
      humidity 
    });
    // then update LEDs/color separately if you like:
    onUpdate({ leds_enabled: form.leds_enabled });
    onUpdate({ color:          form.color });
  };

  return (
    <Form className="g-3">
      <Row className="mb-3">
        <Form.Group as={Col} controlId="dayTemp">
          <Form.Label>Day Temp (°C)</Form.Label>
          <Form.Control
            type="number"
            name="day_temperature"
            value={form.day_temperature}
            onChange={handleChange}
            placeholder="e.g. 25.0"
          />
        </Form.Group>
        <Form.Group as={Col} controlId="dayHum">
          <Form.Label>Day Humidity (%)</Form.Label>
          <Form.Control
            type="number"
            name="day_humidity_target"
            value={form.day_humidity_target}
            onChange={handleChange}
            placeholder="e.g. 60.0"
          />
        </Form.Group>
      </Row>
      <Row className="mb-3">
        <Form.Group as={Col} controlId="nightTemp">
          <Form.Label>Night Temp (°C)</Form.Label>
          <Form.Control
            type="number"
            name="night_temperature"
            value={form.night_temperature}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="nightHum">
          <Form.Label>Night Humidity (%)</Form.Label>
          <Form.Control
            type="number"
            name="night_humidity_target"
            value={form.night_humidity_target}
            onChange={handleChange}
          />
        </Form.Group>
      </Row>

      <Form.Group className="mb-3" controlId="autoLed">
        <Form.Check 
          type="switch"
          name="leds_enabled"
          label="LEDs On in Auto"
          checked={form.leds_enabled}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="colorMode">
        <Form.Check
          type="switch"
          name="color"
          label="Color Mode"
          checked={form.color}
          onChange={handleChange}
        />
      </Form.Group>

      <Button onClick={save} variant="success" className="w-100">
        Save Auto Settings
      </Button>
    </Form>
  );
}
