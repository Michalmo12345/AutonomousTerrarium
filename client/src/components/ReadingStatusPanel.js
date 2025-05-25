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
          Water Level OK
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
        <div className="text-muted mt-3" style={{ fontSize: '0.8rem' }}>
          {new Date(latest.created_at).toLocaleString()}
        </div>
      </Card.Body>
    </Card>
  );
}
