import { Form, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'http://13.60.201.150:5000/api';

export default function ManualControlPanel({ terrarium, setTerrarium, token }) {
  // local color state for manual panel
  const [color, setColor] = useState(terrarium.color);

  useEffect(() => {
    setColor(terrarium.color);
  }, [terrarium.color]);

  const toggleDevice = async (field, routeField) => {
    try {
      const body = { [field]: !terrarium[field] };
      const { data } = await axios.put(
        `${BASE_URL}/terrariums/${terrarium.id}/${routeField}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTerrarium(prev => ({ ...prev, ...data }));
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const saveColor = async () => {
    try {
      const { data } = await axios.put(
        `${BASE_URL}/terrariums/${terrarium.id}/color`,
        { color: Number(color) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTerrarium(prev => ({ ...prev, color: data.color }));
    } catch (err) {
      console.error('Save color failed:', err);
    }
  };

  return (
    <Form className="d-flex flex-column gap-3">
      <Form.Check
        type="switch"
        id="heater-switch"
        label="Heater"
        checked={terrarium.heater_enabled}
        onChange={() => toggleDevice('heater_enabled', 'heater')}
      />
      <Form.Check
        type="switch"
        id="sprinkler-switch"
        label="Sprinkler"
        checked={terrarium.sprinkler_enabled}
        onChange={() => toggleDevice('sprinkler_enabled', 'sprinkler')}
      />
      <Form.Check
        type="switch"
        id="leds-switch"
        label="LEDs"
        checked={terrarium.leds_enabled}
        onChange={() => toggleDevice('leds_enabled', 'leds')}
      />

      <Form.Group controlId="manualColor" className="mb-3">
        <Form.Label>Color (integer)</Form.Label>
        <Form.Control
          type="number"
          value={color}
          onChange={e => setColor(e.target.value)}
        />
      </Form.Group>
      <Button variant="primary" onClick={saveColor}>
        Save Color
      </Button>
    </Form>
  );
}
