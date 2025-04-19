import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../authcontext';
import axios from 'axios';
import NavBar from '../components/NavBar';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend } from 'chart.js';
import 'chart.js/auto'; // Required for Chart.js to work with react-chartjs-2

// Register Chart.js components
ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend);

const TerrariumDetailPage = () => {
  const { id } = useParams();
  const [terrarium, setTerrarium] = useState(null);
  const [animal, setAnimal] = useState(null);
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [temperatureHistory, setTemperatureHistory] = useState([]);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchTerrarium = async () => {
      try {
        // Fetch terrarium details
        const terrariumResponse = await axios.get(`http://localhost:5000/api/terrariums/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTerrarium(terrariumResponse.data);
        setTemperature(terrariumResponse.data.temperature);
        setHumidity(terrariumResponse.data.humidity);

        // Fetch animal details
        const animalResponse = await axios.get(`http://localhost:5000/api/terrariums/${id}/animals`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (animalResponse.data.length > 0) {
          setAnimal(animalResponse.data[0]);
        }

        // Fetch temperature history
        const historyResponse = await axios.get(`http://localhost:5000/api/terrariums/${id}/temperature-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTemperatureHistory(historyResponse.data);
      } catch (err) {
        console.error('Error fetching terrarium:', err);
        setError(err.response?.data?.error || 'Failed to load terrarium details');
      }
    };
    if (token) fetchTerrarium();
  }, [id, token]);

  const handleUpdate = async () => {
    setError('');
    if (!temperature || !humidity) {
      setError('Temperature and humidity are required');
      return;
    }
    try {
      await axios.put(
        `http://localhost:5000/api/terrariums/${id}`,
        { name: terrarium.name, temperature, humidity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTerrarium({ ...terrarium, temperature, humidity });

      // Fetch updated temperature history
      const historyResponse = await axios.get(`http://localhost:5000/api/terrariums/${id}/temperature-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTemperatureHistory(historyResponse.data);
    } catch (err) {
      setError('Failed to update terrarium');
    }
  };

  // Prepare chart data
  const chartData = {
    labels: temperatureHistory.map((entry) => new Date(entry.created_at).toLocaleDateString()),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: temperatureHistory.map((entry) => entry.temperature),
        fill: false,
        borderColor: '#888',
        tension: 0.1,
        pointBackgroundColor: '#ccc',
        pointBorderColor: '#ccc',
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          color: '#ccc',
        },
        ticks: {
          color: '#ccc',
        },
        grid: {
          color: '#333',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Temperature (°C)',
          color: '#ccc',
        },
        ticks: {
          color: '#ccc',
        },
        grid: {
          color: '#333',
        },
        beginAtZero: false,
      },
    },
    plugins: {
      legend: {
        labels: {
          color: '#ccc',
        },
      },
      tooltip: {
        backgroundColor: '#111',
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
    maintainAspectRatio: false,
  };

  if (error) {
    return (
      <>
        <NavBar />
        <Container className="py-5">
          <p className="text-danger">{error}</p>
          <Link to="/dashboard" className="btn btn-outline-light">Back to Dashboard</Link>
        </Container>
      </>
    );
  }

  if (!terrarium) {
    return (
      <>
        <NavBar />
        <Container className="py-5">
          <p className="text-white">Loading...</p>
        </Container>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <Container className="py-5">
        <div className="mb-5">
          <Link to="/dashboard" className="btn btn-outline-light mb-4">
            ← Back to Dashboard
          </Link>
          <h1 className="text-white display-5 fw-bold">{terrarium.name}</h1>
          <div className="gradient-underline mb-4"></div>
          <p className="text-muted">Detailed view of your terrarium environment</p>
        </div>
        <Row>
          <Col lg={6} className="mb-4">
            <Card className="text-white">
              <Card.Body>
                <h3 className="text-white mb-4">Environment Settings</h3>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Temperature (°C)</Form.Label>
                    <Form.Control
                      type="number"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="bg-dark text-white border-light"
                      placeholder="Enter temperature"
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label>Humidity (%)</Form.Label>
                    <Form.Control
                      type="number"
                      value={humidity}
                      onChange={(e) => setHumidity(e.target.value)}
                      className="bg-dark text-white border-light"
                      placeholder="Enter humidity"
                    />
                  </Form.Group>
                  {error && <p className="text-danger mb-3">{error}</p>}
                  <Button variant="primary" onClick={handleUpdate}>
                    Update Settings
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={6} className="mb-4">
            <Card className="text-white">
              <Card.Body>
                <h3 className="text-white mb-4">Terrarium Overview</h3>
                <div className="mb-3">
                  <span className="text-muted">Current Temperature:</span> {terrarium.temperature}°C
                </div>
                <div className="mb-3">
                  <span className="text-muted">Current Humidity:</span> {terrarium.humidity}%
                </div>
                <div className="mb-3">
                  <span className="text-muted">Last Updated:</span> {new Date().toLocaleString()}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className="mb-4">
          <Col>
            <Card className="text-white">
              <Card.Body>
                <h3 className="text-white mb-4">Temperature History (Last 30 Days)</h3>
                {temperatureHistory.length > 0 ? (
                  <div style={{ height: '300px' }}>
                    <Line data={chartData} options={chartOptions} />
                  </div>
                ) : (
                  <p className="text-muted">No temperature history available. Update the terrarium to start tracking.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col>
            <Card className="text-white">
              <Card.Body>
                <h3 className="text-white mb-4">Animal Profile</h3>
                {animal ? (
                  <Row>
                    <Col md={4} className="mb-3">
                      {animal.image_url ? (
                        <img
                          src={animal.image_url}
                          alt={animal.name}
                          className="rounded"
                          style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          className="rounded bg-dark d-flex align-items-center justify-content-center"
                          style={{ width: '100%', height: '200px' }}
                        >
                          <span className="text-muted">No Image Available</span>
                        </div>
                      )}
                    </Col>
                    <Col md={8}>
                      <h4 className="text-white">{animal.name}</h4>
                      <p className="mb-2"><span className="text-muted">Species:</span> {animal.species}</p>
                      <p className="mb-2"><span className="text-muted">Description:</span> {animal.description}</p>
                      <p className="mb-2"><span className="text-muted">Terrarium ID:</span> {animal.terrarium_id}</p>
                    </Col>
                  </Row>
                ) : (
                  <p className="text-muted">No animal assigned to this terrarium.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default TerrariumDetailPage;