import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Modal, Form } from 'react-bootstrap';
import NavBar from '../components/NavBar';
import { useAuth } from '../authContext';
import {
  getTerrarium,
  getLatestReading,
  updateTerrarium,
  deleteTerrarium,
  updateManualDevices,
  updateAutomaticSettings
} from '../api';

const TerrariumDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [terrarium, setTerrarium] = useState(null);
  const [latestReading, setLatestReading] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mode, setMode] = useState('manual');
  const [formState, setFormState] = useState({
    temperature: '',
    humidity: '',
    leds: false,
    heating: false,
    sprinkler: false,
    dayTemp: '',
    nightTemp: '',
    dayHumidity: '',
    nightHumidity: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const terrariumData = await getTerrarium(id, token);
        const reading = await getLatestReading(id, token);
        setTerrarium(terrariumData);
        setFormState({
          temperature: terrariumData.temperature,
          humidity: terrariumData.humidity,
          leds: terrariumData.leds,
          heating: terrariumData.heating,
          sprinkler: terrariumData.sprinkler,
          dayTemp: terrariumData.day_temp,
          nightTemp: terrariumData.night_temp,
          dayHumidity: terrariumData.day_humidity,
          nightHumidity: terrariumData.night_humidity
        });
        if (reading) setLatestReading(reading);
      } catch (err) {
        setError('Failed to fetch terrarium details');
      }
      setIsLoading(false);
    };
    fetchData();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      await deleteTerrarium(id, token);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to delete terrarium');
    }
  };

  const handleSubmit = async () => {
    try {
      if (mode === 'manual') {
        await updateManualDevices(id, {
          leds: formState.leds,
          heating: formState.heating,
          sprinkler: formState.sprinkler
        }, token);
      } else {
        await updateAutomaticSettings(id, {
          day_temp: formState.dayTemp,
          night_temp: formState.nightTemp,
          day_humidity: formState.dayHumidity,
          night_humidity: formState.nightHumidity
        }, token);
      }
      const updated = await getTerrarium(id, token);
      setTerrarium(updated);
    } catch (err) {
      setError('Update failed');
    }
  };

  const handleChange = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return <><NavBar /><Container><p className="text-white">Loading...</p></Container></>;
  }

  if (error) {
    return (
      <><NavBar /><Container><Alert variant="danger">{error}</Alert></Container></>
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
              <Button variant="primary" onClick={handleSubmit}>Save</Button>
              <Button variant="danger" onClick={() => setShowDeleteModal(true)}>Delete</Button>
            </div>
          </div>
          <div className="gradient-underline mb-4"></div>
        </div>

        <Row>
          <Col md={6} className="mb-4">
            <Card className="text-white">
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Mode</Form.Label>
                    <Form.Select value={mode} onChange={(e) => setMode(e.target.value)} className="bg-dark text-white border-light">
                      <option value="manual">Manual</option>
                      <option value="automatic">Automatic</option>
                    </Form.Select>
                  </Form.Group>

                  {mode === 'manual' ? (
                    <>
                      <Form.Check
                        type="switch"
                        label="LEDs"
                        checked={formState.leds}
                        onChange={(e) => handleChange('leds', e.target.checked)}
                        className="text-white"
                      />
                      <Form.Check
                        type="switch"
                        label="Heating"
                        checked={formState.heating}
                        onChange={(e) => handleChange('heating', e.target.checked)}
                        className="text-white"
                      />
                      <Form.Check
                        type="switch"
                        label="Sprinkler"
                        checked={formState.sprinkler}
                        onChange={(e) => handleChange('sprinkler', e.target.checked)}
                        className="text-white"
                      />
                    </>
                  ) : (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>Day Temperature (°C)</Form.Label>
                        <Form.Control
                          type="number"
                          value={formState.dayTemp}
                          onChange={(e) => handleChange('dayTemp', e.target.value)}
                          className="bg-dark text-white border-light"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Night Temperature (°C)</Form.Label>
                        <Form.Control
                          type="number"
                          value={formState.nightTemp}
                          onChange={(e) => handleChange('nightTemp', e.target.value)}
                          className="bg-dark text-white border-light"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Day Humidity (%)</Form.Label>
                        <Form.Control
                          type="number"
                          value={formState.dayHumidity}
                          onChange={(e) => handleChange('dayHumidity', e.target.value)}
                          className="bg-dark text-white border-light"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Night Humidity (%)</Form.Label>
                        <Form.Control
                          type="number"
                          value={formState.nightHumidity}
                          onChange={(e) => handleChange('nightHumidity', e.target.value)}
                          className="bg-dark text-white border-light"
                        />
                      </Form.Group>
                    </>
                  )}
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card className="text-white">
              <Card.Body>
                <h4 className="text-white">Current State</h4>
                <p><strong>Temperature:</strong> {terrarium.temperature}°C</p>
                <p><strong>Humidity:</strong> {terrarium.humidity}%</p>
                {latestReading && (
                  <div className="mt-3">
                    <h5 className="text-white">Latest Sensor Reading</h5>
                    <p><strong>Temperature:</strong> {latestReading.temperature}°C</p>
                    <p><strong>Humidity:</strong> {latestReading.humidity}%</p>
                    <p><strong>Time:</strong> {new Date(latestReading.created_at).toLocaleString()}</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered dialogClassName="modal-dark">
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
