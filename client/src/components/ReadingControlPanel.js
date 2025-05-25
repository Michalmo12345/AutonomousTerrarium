import { Form, Button, Card } from 'react-bootstrap';
import { useState } from 'react';
import axios from 'axios';

const BASE_URL = 'http://13.60.201.150:5000/api';

export default function ReadingControlPanel({ terrarium, token, setTerrarium }) {
  const [controls, setControls] = useState({
    water_level_ok: terrarium.water_level_ok,
    heater_on:      terrarium.heater_enabled,
    sprinkler_on:   terrarium.sprinkler_enabled,
    leds_on:        terrarium.leds_enabled,
  });

  const handleToggle = async (field) => {
    const route = field;
    const value = !controls[field];
    try {
      const { data } = await axios.put(
        `${BASE_URL}/readings/${terrarium.id}/${route}`,
        { [field]: value },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setControls(prev => ({ ...prev, [field]: data[field] }));
      // optionally also update terrarium state if needed
      setTerrarium(prev => ({ ...prev, [field]: data[field] }));
    } catch (err) {
      console.error(`Failed to toggle ${field}:`, err);
    }
  };

  return (
    <Card bg="dark" text="white">
      <Card.Header>Sensor Controls</Card.Header>
      <Card.Body className="d-flex flex-column gap-3">
        {Object.entries(controls).map(([field, value]) => (
          <Form.Check
            key={field}
            type="switch"
            id={field}
            label={field.replace(/_/g, ' ')}
            checked={value}
            onChange={() => handleToggle(field)}
          />
        ))}
        <Button variant="primary" onClick={() => {/* no-op or refetch readings*/}}>Refresh</Button>
      </Card.Body>
    </Card>
  );
}
