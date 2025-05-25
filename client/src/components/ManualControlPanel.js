import { Form } from 'react-bootstrap';
import axios from 'axios';

const BASE_URL = 'http://13.60.201.150:5000/api';

export default function ManualControlPanel({ terrarium, setTerrarium, token }) {
  const toggle = async (field, body) => {
    try {
      const { data } = await axios.put(
        `${BASE_URL}/terrariums/${terrarium.id}/${field}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // update only that field
      setTerrarium(prev => ({ ...prev, ...data }));
    } catch (err) {
      console.error('Manual toggle failed:', err);
    }
  };

  return (
    <Form className="d-flex flex-column gap-3">
      <Form.Check
        type="switch"
        id="heater-switch"
        label="Heater"
        checked={terrarium.heater_enabled}
        onChange={() => toggle('heater', { heater_enabled: !terrarium.heater_enabled })}
      />
      <Form.Check
        type="switch"
        id="sprinkler-switch"
        label="Sprinkler"
        checked={terrarium.sprinkler_enabled}
        onChange={() => toggle('sprinkler', { sprinkler_enabled: !terrarium.sprinkler_enabled })}
      />
      <Form.Check
        type="switch"
        id="leds-switch"
        label="LEDs"
        checked={terrarium.leds_enabled}
        onChange={() => toggle('leds', { leds_enabled: !terrarium.leds_enabled })}
      />
    </Form>
  );
}
