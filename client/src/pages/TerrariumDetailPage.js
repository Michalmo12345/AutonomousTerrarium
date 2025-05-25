import { Container, Row, Col, Button, Spinner, Alert, Card, Table, Form } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../authContext';
import axios from 'axios';

import ManualControlPanel from '../components/ManualControlPanel';
import AutomaticSettingsPanel from '../components/AutomaticSettingsPanel';
import NavBar from '../components/NavBar';

const BASE_URL = 'http://13.60.201.150:5000/api';

const TerrariumDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [terrarium, setTerrarium] = useState(null);
  const [readings, setReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return navigate('/login');
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const { data: t } = await axios.get(`${BASE_URL}/terrariums/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTerrarium(t);
        const { data: r } = await axios.get(`${BASE_URL}/readings/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReadings(r);
      } catch (err) {
        const status = err.response?.status;
        if (status === 401 || status === 403) return navigate('/login');
        setError(err.response?.data?.error || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [id, token, navigate]);

  const handleUpdate = async (updates) => {
    try {
      const { data } = await axios.put(
        `${BASE_URL}/terrariums/${id}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTerrarium(prev => ({ ...prev, ...data }));
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    }
  };

  const handleDayMode = async (dayValue) => {
    try {
      const { data } = await axios.put(
        `${BASE_URL}/terrariums/${id}/day`,
        { day: dayValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTerrarium(prev => ({ ...prev, day: data.day }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to switch day/night');
    }
  };

  if (isLoading) return (
    <><NavBar /><Container className="py-5 text-center"><Spinner animation="border" /></Container></>
  );
  if (error) return (
    <><NavBar /><Container className="py-5"><Alert variant="danger">{error}</Alert><Link to="/dashboard" className="btn btn-outline-light">Back</Link></Container></>
  );

  return (
    <>
      <NavBar />
      <Container className="py-5">
        <Link to="/dashboard" className="btn btn-outline-light mb-4">← Dashboard</Link>
        <h1 className="text-white mb-4">{terrarium.name}</h1>
        <Row>
          <Col md={6} className="mb-4">
            <Card bg="dark" text="white" className="h-100">
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Form.Check
                      type="switch"
                      id="day-night-switch"
                      label={terrarium.day ? 'Day Mode' : 'Night Mode'}
                      checked={terrarium.day}
                      onChange={() => handleDayMode(!terrarium.day)}
                    />
                  </div>
                  <Button size="sm" onClick={() => handleUpdate({ manual_mode: !terrarium.manual_mode })}>
                    Switch to {terrarium.manual_mode ? 'Automatic' : 'Manual'}
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                {terrarium.manual_mode
                  ? <ManualControlPanel terrarium={terrarium} onUpdate={handleUpdate} />
                  : <AutomaticSettingsPanel terrarium={terrarium} onUpdate={handleUpdate} />
                }
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card bg="dark" text="white" className="h-100">
              <Card.Header>Recent Readings</Card.Header>
              <Card.Body className="p-0">
                {readings.length === 0
                  ? <div className="p-3">No readings.</div>
                  : (
                    <Table
                      variant="dark"
                      striped
                      hover
                      responsive
                      className="mb-0"
                      style={{ maxHeight: '400px', overflowY: 'auto', display: 'block' }}
                    >
                      <thead>
                        <tr>
                          <th>Time</th><th>Temp</th><th>Hum</th><th>Heater</th><th>Sprinkler</th><th>LEDs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {readings.slice(0, 10).map(r => (
                          <tr key={r.id}>
                            <td>{new Date(r.created_at).toLocaleTimeString()}</td>
                            <td>{Number(r.temperature).toFixed(1)}</td>
                            <td>{Number(r.humidity).toFixed(1)}</td>
                            <td>{r.heater_on ? '✔' : '✖'}</td>
                            <td>{r.sprinkler_on ? '✔' : '✖'}</td>
                            <td>{r.leds_on ? '✔' : '✖'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
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
