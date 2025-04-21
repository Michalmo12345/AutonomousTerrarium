import { Container, Row, Col, Card, Form, Button, Alert, Modal } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../authContext';
import axios from 'axios';
import NavBar from '../components/NavBar';

const TerrariumDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [terrarium, setTerrarium] = useState(null);
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [latestReading, setLatestReading] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('Please log in to view this page.');
        navigate('/login');
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const terrariumResponse = await axios.get(`http://localhost:5000/api/terrariums/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const readingsResponse = await axios.get(`http://localhost:5000/api/readings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const terrariumData = terrariumResponse.data;
        setTerrarium(terrariumData);
        setTemperature(terrariumData.temperature);
        setHumidity(terrariumData.humidity);

        if (readingsResponse.data.length > 0) {
          setLatestReading(readingsResponse.data[0]);
        }
      } catch (err) {
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, token, navigate]);

  const handleError = (err) => {
    if (err.response) {
      if (err.response.status === 401 || err.response.status === 403) {
        setError('You are not authorized to view this terrarium.');
      } else {
        setError(err.response.data?.error || 'Failed to load terrarium details');
      }
    } else {
      setError('Unable to connect to the server.');
    }
  };

  const handleUpdate = async () => {
    if (!temperature || !humidity) {
      setError('Temperature and humidity are required');
      return;
    }

    try {
      const updatedData = {
        name: terrarium.name,
        temperature: Number(temperature),
        humidity: Number(humidity)
      };

      const response = await axios.put(
        `http://localhost:5000/api/terrariums/${id}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTerrarium(response.data);
      setError('');
    } catch (err) {
      handleError(err);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/terrariums/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/dashboard');
    } catch (err) {
      handleError(err);
      setShowDeleteModal(false);
    }
  };

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

  if (error) {
    return (
      <>
        <NavBar />
        <Container className="py-5">
          <Alert variant="danger">{error}</Alert>
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
          <Alert variant="danger">Terrarium data could not be loaded.</Alert>
          <Link to="/dashboard" className="btn btn-outline-light">Back to Dashboard</Link>
        </Container>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <Container className="py-5">
        <div className="mb-4">
          <Link to="/dashboard" className="btn btn-outline-light mb-3">← Back to Dashboard</Link>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h1 className="text-white display-5 fw-bold mb-0">{terrarium.name}</h1>
            <div className="d-flex gap-2">
              <Button variant="primary" onClick={handleUpdate}>Update Settings</Button>
              <Button variant="danger" onClick={() => setShowDeleteModal(true)}>Delete Terrarium</Button>
            </div>
          </div>
          <div className="gradient-underline mb-4"></div>
        </div>

        <Row>
          <Col lg={6} className="mb-4">
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
                  <Form.Group className="mb-0">
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
          </Col>
          <Col lg={6} className="mb-4">
            <Card className="text-white h-100">
              <Card.Body>
                <h3 className="text-white mb-4">Terrarium Overview</h3>
                <div className="mb-3">
                  <span className="text-white">Current Temperature:</span> {terrarium.temperature}°C
                </div>
                <div className="mb-3">
                  <span className="text-white">Current Humidity:</span> {terrarium.humidity}%
                </div>
                <div className="mb-3">
                  <span className="text-white">Last Updated:</span> {
                    terrarium.updated_at
                      ? new Date(terrarium.updated_at).toLocaleString()
                      : new Date().toLocaleString()
                  }
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
          </Col>
        </Row>

        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          centered
          dialogClassName="modal-dark"
        >
          <Modal.Header closeButton className="bg-dark text-white border-light">
            <Modal.Title>Delete Terrarium</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-dark text-white">
            <p>Are you sure you want to delete the terrarium "{terrarium.name}"?</p>
            <p className="text-danger">This action cannot be undone.</p>
          </Modal.Body>
          <Modal.Footer className="bg-dark border-light">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default TerrariumDetailPage;
