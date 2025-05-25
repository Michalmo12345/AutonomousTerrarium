import { Card } from 'react-bootstrap';

const CurrentState = ({ terrarium, latestReading }) => {
  return (
    <Card bg="dark" text="white" className="mb-3">
      <Card.Header>Current State</Card.Header>
      <Card.Body>
        <p>Temperature: {latestReading.temperature} °C</p>
        <p>Humidity: {latestReading.humidity} %</p>
        <p>LEDs: {terrarium.leds ? 'On' : 'Off'}</p>
        <p>Heating: {terrarium.heating ? 'On' : 'Off'}</p>
        <p>Sprinkler: {terrarium.sprinkler ? 'On' : 'Off'}</p>
      </Card.Body>
    </Card>
  );
};

export default CurrentState;
