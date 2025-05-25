import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Alert, Modal, Form, Card } from 'react-bootstrap';
import NavBar from '../components/NavBar';


const API_BASE = 'http://13.60.201.150:5000/api'

const TerrariumDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [terrarium, setTerrarium] = useState(null);
  const [latestReading, setLatestReading] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mode, setMode] = useState('manual');
  const [formState, setFormState] = useState({
    leds: false,
    heating: false,
    sprinkler: false,
    dayTemp: '',
    nightTemp: '',
    dayHumidity: '',
    nightHumidity: '',
  });

  // Helper: fetch terrarium data
  const fetchTerrarium = async () => {
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      if (!res.ok) throw new Error('Failed to fetch terrarium');
      const data = await res.json();
      setTerrarium(data);

      setMode(data.manual_mode ? 'manual' : 'automatic');

      setFormState({
        leds: data.leds || false,
        heating: data.heating || false,
        sprinkler: data.sprinkler || false,
        dayTemp: data.day_temp || '',
        nightTemp: data.night_temp || '',
        dayHumidity: data.day_humidity || '',
        nightHumidity: data.night_humidity || '',
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchLatestReading = async () => {
    try {
      const res = await fetch(`${API_BASE}/${id}/latest-reading`);
      if (!res.ok) throw new Error('Failed to fetch latest reading');
      const data = await res.json();
      setLatestReading(data);
    } catch {
    }
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchTerrarium(), fetchLatestReading()])
      .finally(() => setIsLoading(false));
  }, [id]);

  const updateModeOnServer = async (newMode) => {
    try {
      const res = await fetch(`${API_BASE}/${id}/manual-mode`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manual_mode: newMode === 'manual' }),
      });
      if (!res.ok) throw new Error('Failed to update mode');
      const data = await res.json();

      if (data.manual_mode === false) {
        setFormState(prev => ({
          ...prev,
          heating: false,
          sprinkler: false,
        }));
      }
      setTerrarium(prev => ({ ...prev, manual_mode: data.manual_mode }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleModeChange = async (e) => {
    const newMode = e.target.value;
    setMode(newMode);
    await updateModeOnServer(newMode);
  };

  const handleSave = async () => {
    try {
      if (mode === 'manual') {
        const body = {
          leds: formState.leds,
          heating: formState.heating,
          sprinkler: formState.sprinkler,
        };
        const res = await fetch(`${API_BASE}/${id}/manual-devices`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Failed to update manual devices');
      } else {
        const body = {
          day_temp: Number(formState.dayTemp),
          night_temp: Number(formState.nightTemp),
          day_humidity: Number(formState.dayHumidity),
          night_humidity: Number(formState.nightHumidity),
        };
        const res = await fetch(`${API_BASE}/${id}/automatic-settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Failed to update automatic settings');
      }
      await fetchTerrarium();
      alert('Settings saved');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete terrarium');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) return <>
    <NavBar />
    <Container><p className="text-white">Loading...</p></Container>
  </>;

  if (error) return <>
    <NavBar />
    <Container><Alert variant="danger">{error}</Alert></Container>
  </>;

  return (
    <>
      <NavBar />
      <Container className="py-5">
        <div className="mb-4">
          <Link to="/dashboard" className="btn btn-outline-light mb-3">← Back to Dashboard</Link>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h1 className="text-white display-5 fw-bold mb-0">{terrarium.name}</h1>
            <div className="d-flex gap-2">
              <Button variant="primary" onClick={handleSave}>Save</Button>
              <Button variant="danger" onClick={() => setShowDeleteModal(true)}>Delete</Button>
            </div>
          </div>
          <div className="gradient-underline mb-4"></div>
        </div>

        <Row>
          <Col md={6} className="mb-4">
            <Card className="text-white bg-dark p-3">
              <Form.Group className="mb-3">
                <Form.Label>Mode</Form.Label>
                <Form.Select
                  value={mode}
                  onChange={handleModeChange}
                  className="bg-dark text-white border-light"
                >
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
                    onChange={e => handleChange('leds', e.target.checked)}
                    className="text-white"
                  />
                  <Form.Check
                    type="switch"
                    label="Heating"
                    checked={formState.heating}
                    onChange={e => handleChange('heating', e.target.checked)}
                    className="text-white"
                  />
                  <Form.Check
                    type="switch"
                    label="Sprinkler"
                    checked={formState.sprinkler}
                    onChange={e => handleChange('sprinkler', e.target.checked)}
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
                      onChange={e => handleChange('dayTemp', e.target.value)}
                      className="bg-dark text-white border-light"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Night Temperature (°C)</Form.Label>
                    <Form.Control
                      type="number"
                      value={formState.nightTemp}
                      onChange={e => handleChange('nightTemp', e.target.value)}
                      className="bg-dark text-white border-light"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Day Humidity (%)</Form.Label>
                    <Form.Control
                      type="number"
                      value={formState.dayHumidity}
                      onChange={e => handleChange('dayHumidity', e.target.value)}
                      className="bg-dark text-white border-light"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Night Humidity (%)</Form.Label>
                    <Form.Control
                      type="number"
                      value={formState.nightHumidity}
                      onChange={e => handleChange('nightHumidity', e.target.value)}
                      className="bg-dark text-white border-light"
                    />
                  </Form.Group>
                </>
              )}
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card className="text-white bg-dark p-3">
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
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default TerrariumDetailPage;
