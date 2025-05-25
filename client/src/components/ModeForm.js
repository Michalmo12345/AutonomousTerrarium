import { Card, Form } from 'react-bootstrap';

const ModeForm = ({ mode, setMode, formState, handleChange }) => {
  return (
    <Card bg="dark" text="white" className="mb-3">
      <Card.Header>Control Mode</Card.Header>
      <Card.Body>
        <Form>
          <Form.Check
            inline
            label="Manual"
            name="mode"
            type="radio"
            id="manual"
            checked={mode === 'manual'}
            onChange={() => setMode('manual')}
          />
          <Form.Check
            inline
            label="Automatic"
            name="mode"
            type="radio"
            id="automatic"
            checked={mode === 'automatic'}
            onChange={() => setMode('automatic')}
          />

          {mode === 'manual' ? (
            <>
              <Form.Check
                type="switch"
                id="leds"
                label="LEDs"
                checked={formState.leds}
                onChange={(e) => handleChange('leds', e.target.checked)}
              />
              <Form.Check
                type="switch"
                id="heating"
                label="Heating"
                checked={formState.heating}
                onChange={(e) => handleChange('heating', e.target.checked)}
              />
              <Form.Check
                type="switch"
                id="sprinkler"
                label="Sprinkler"
                checked={formState.sprinkler}
                onChange={(e) => handleChange('sprinkler', e.target.checked)}
              />
            </>
          ) : (
            <>
              <Form.Group className="mt-3">
                <Form.Label>Day Temperature (°C)</Form.Label>
                <Form.Control
                  type="number"
                  value={formState.dayTemp}
                  onChange={(e) => handleChange('dayTemp', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>Night Temperature (°C)</Form.Label>
                <Form.Control
                  type="number"
                  value={formState.nightTemp}
                  onChange={(e) => handleChange('nightTemp', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>Day Humidity (%)</Form.Label>
                <Form.Control
                  type="number"
                  value={formState.dayHumidity}
                  onChange={(e) => handleChange('dayHumidity', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>Night Humidity (%)</Form.Label>
                <Form.Control
                  type="number"
                  value={formState.nightHumidity}
                  onChange={(e) => handleChange('nightHumidity', e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ModeForm;
