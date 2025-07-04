import { Card } from 'react-bootstrap';

export default function ReadingStatusPanel({ latest }) {
  if (!latest) return null;

  const StatusDot = ({ value }) => (
    <span
      style={{
        display: 'inline-block',
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: value ? 'green' : 'red',
        marginRight: 8,
      }}
    />
  );

  return (
    <Card bg="dark" text="white" className="mb-4 shadow-sm">
      <Card.Header>Status (Latest Reading)</Card.Header>
      <Card.Body>
        <div className="mb-2">
          <StatusDot value={latest.water_level_ok} />
          Water Level
        </div>
        <div className="mb-2">
          <StatusDot value={latest.heater_on} />
          Heater
        </div>
        <div className="mb-2">
          <StatusDot value={latest.sprinkler_on} />
          Sprinkler
        </div>
        <div className="mb-2">
          <StatusDot value={latest.leds_on} />
          LEDs
        </div>
      </Card.Body>
    </Card>
  );
}
