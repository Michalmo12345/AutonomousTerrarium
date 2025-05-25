import { Card, Row, Col } from 'react-bootstrap';
import { CircleFill } from 'react-bootstrap-icons';

export default function ReadingStatusPanel({ latest }) {
  if (!latest) {
    return (
      <Card bg="dark" text="white" className="h-100 shadow-sm">
        <Card.Header>Latest Status</Card.Header>
        <Card.Body className="text-center">No readings.</Card.Body>
      </Card>
    );
  }

  const statuses = [
    { label: 'Water Level OK', field: 'water_level_ok' },
    { label: 'Heater On',      field: 'heater_on'      },
    { label: 'Sprinkler On',   field: 'sprinkler_on'   },
    { label: 'LEDs On',        field: 'leds_on'        },
  ];

  return (
    <Card bg="dark" text="white" className="h-100 shadow-sm">
      <Card.Header>Latest Status</Card.Header>
      <Card.Body>
        {statuses.map(({ label, field }) => (
          <Row key={field} className="align-items-center mb-2">
            <Col xs={8}>{label}</Col>
            <Col xs={4} className="text-end">
              <CircleFill 
                size={20}
                color={latest[field] ? '#28a745' : '#dc3545'}
              />
            </Col>
          </Row>
        ))}
        <div className="text-muted small">Updated: {new Date(latest.created_at).toLocaleTimeString()}</div>
      </Card.Body>
    </Card>
  );
}