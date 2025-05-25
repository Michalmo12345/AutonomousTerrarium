import { Form, Card } from 'react-bootstrap';

const EnvironmentSettingsForm = ({ temperature, humidity, setTemperature, setHumidity }) => (
  <Card className="text-white h-100">
    <Card.Body>
      <h3 className="text-white mb-4">Environment Settings</h3>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Temperature (°C)</Form.Label>
          <Form.Control
            type="number"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            className="bg-dark text-white border-light"
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Humidity (%)</Form.Label>
          <Form.Control
            type="number"
            step="0.1"
            value={humidity}
            onChange={(e) => setHumidity(e.target.value)}
            className="bg-dark text-white border-light"
          />
        </Form.Group>
      </Form>
    </Card.Body>
  </Card>
);

export default EnvironmentSettingsForm;
