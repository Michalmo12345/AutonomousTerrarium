import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../authContext';
import axios from 'axios';
import NavBar from '../components/NavBar';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend } from 'chart.js';
import 'chart.js/auto';

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend);

const TerrariumDetailPage = () => {
  const { id } = useParams();
  const [terrarium, setTerrarium] = useState(null);
  const [animal, setAnimal] = useState(null);
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [temperatureHistory, setTemperatureHistory] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTerrarium = async () => {
      setIsLoading(true);
      setError('');
      try {
        console.log(`Fetching data for terrarium ID ${id} with token: ${token}`); // Debug log

        // Fetch terrarium details
        const terrariumResponse = await axios.get(`http://localhost:5000/api/terrariums/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Terrarium response:', terrariumResponse.data);
        setTerrarium(terrariumResponse.data);
        setTemperature(terrariumResponse.data.temperature);
        setHumidity(terrariumResponse.data.humidity);

        // Fetch animal details
        const animalResponse = await axios.get(`http://localhost:5000/api/terrariums/${id}/animals`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Animal response:', animalResponse.data);
        if (animalResponse.data.length > 0) {
          setAnimal(animalResponse.data[0]);
        }

        // Fetch temperature history
        const historyResponse = await axios.get(`http://localhost:5000/api/terrariums/${id}/temperature-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Temperature history response:', historyResponse.data);
        setTemperatureHistory(historyResponse.data);
      } catch (err) {
        console.error('Error fetching terrarium:', err);
        if (err.response) {
          if (err.response.status === 401 || err.response.status === 403) {
            setError('You are not authorized to view this terrarium. Please log in with the correct account.');
          } else {
            setError(err.response.data?.error || 'Failed to load terrarium details');
          }
        } else {
          setError('Unable to connect to the server. Please check if the backend is running.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchTerrarium();
    } else {
      setError('Please log in to view this page.');
      navigate('/login');
    }
  }, [id, token, navigate]);

  const handleUpdate = async () => {
    setError('');
    if (!temperature || !humidity) {
      setError('Temperature and humidity are required');
      return;
    }
    try {
      await axios.put(
        `http://localhost:5000/api/terrariums/${id}`,
        { name: terrarium.name, temperature: Number(temperature), humidity: Number(humidity) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTerrarium({ ...terrarium, temperature: Number(temperature), humidity: Number(humidity) });

      // Fetch updated temperature history
      const historyResponse = await axios.get(`http://localhost:5000/api/terrariums/${id}/temperature-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTemperatureHistory(historyResponse.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update terrarium');
    }
  };

  // Prepare chart data
  const chartData = {
    labels: temperatureHistory.map((entry) => new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
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
          maxTicksLimit: 10,
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
          stepSize: 1,
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

  if (isLoading) {
    return (
      <>
        <NavBar />
        <Container className="py-5">
          <p className="text-white">Loading...</p>
        </Container>
      </>
    );
  }

  if (!terrarium) {
    return (
      <>
        <NavBar />
        <Container className="py-5">
          <p className="text-danger">Terrarium data could not be loaded.</p>
          <Link to="/dashboard" className="btn btn-outline-light">Back to Dashboard</Link>
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
                      step="0.1"
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
                      step="0.1"
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