import { Card } from 'react-bootstrap';

const TerrariumOverview = ({ terrarium, latestReading }) => (
  <Card className="text-white h-100">
    <Card.Body>
      <h3 className="text-white mb-4">Terrarium Overview</h3>
      <div className="mb-3"><span className="text-white">Current Temperature:</span> {terrarium.temperature}°C</div>
      <div className="mb-3"><span className="text-white">Current Humidity:</span> {terrarium.humidity}%</div>
      <div className="mb-3">
        <span className="text-white">Last Updated:</span>{' '}
        {terrarium.updated_at ? new Date(terrarium.updated_at).toLocaleString() : new Date().toLocaleString()}
      </div>
      {latestReading && (
        <div className="mt-4">
          <h5 className="text-white">Latest Reading from Sensor</h5>
          <div><span className="text-white">Temperature:</span> {latestReading.temperature}°C</div>
          <div><span className="text-white">Humidity:</span> {latestReading.humidity}%</div>
          <div><span className="text-white">Time:</span> {new Date(latestReading.created_at).toLocaleString()}</div>
        </div>
      )}
    </Card.Body>
  </Card>
);

export default TerrariumOverview;
