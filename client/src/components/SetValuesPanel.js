import { Card, ListGroup } from 'react-bootstrap';

export default function SetValuesPanel({ terrarium }) {
  return (
    <Card bg="dark" text="white" className="shadow-sm">
      <Card.Header>Set Values</Card.Header>
      <ListGroup variant="flush">
        <ListGroup.Item className="bg-dark text-white d-flex justify-content-between">
          <span>Day Temperature</span>
          <span>{terrarium.day_temperature} °C</span>
        </ListGroup.Item>
        <ListGroup.Item className="bg-dark text-white d-flex justify-content-between">
          <span>Night Temperature</span>
          <span>{terrarium.night_temperature} °C</span>
        </ListGroup.Item>
        <ListGroup.Item className="bg-dark text-white d-flex justify-content-between">
          <span>Humidity</span>
          <span>{terrarium.humidity} %</span>
        </ListGroup.Item>
      </ListGroup>
    </Card>
  );
}
