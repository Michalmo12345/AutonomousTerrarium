// File: src/pages/TerrariumDetailPage.js
import { Container, Row, Col, Card, Spinner, Alert, Table, Form, Button } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../authContext';
import axios from 'axios';

import ManualControlPanel from '../components/ManualControlPanel';
import AutomaticSettingsPanel from '../components/AutomaticSettingsPanel';
import NavBar from '../components/NavBar';

const BASE_URL = 'http://13.60.201.150:5000/api';

export default function TerrariumDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [terrarium, setTerrarium] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return navigate('/login');
    (async () => {
      setLoading(true);
      try {
        const [terrRes, readRes] = await Promise.all([
          axios.get(`${BASE_URL}/terrariums/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BASE_URL}/readings/${id}`,  { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setTerrarium(terrRes.data);
        setReadings(readRes.data);
      } catch (err) {
        const status = err.response?.status;
        if ([401, 403].includes(status)) return navigate('/login');
        setError(err.response?.data?.error || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token, navigate]);

  const handleGenericUpdate = async updates => {
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

  const handleDaySwitch = async value => {
    try {
      const { data } = await axios.put(
        `${BASE_URL}/terrariums/${id}/day`,
        { day: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTerrarium(prev => ({ ...prev, day: data.day }));
    } catch (err) {
      setError(err.response?.data?.error || 'Day/Night toggle failed');
    }
  };

  if (loading) {
    return <><NavBar /><Container className="py-5 text-center"><Spinner animation="border"/></Container></>;
  }

  if (error) {
    return <><NavBar /><Container className="py-5"><Alert variant="danger">{error}</Alert><Link to="/dashboard" className="btn btn-outline-light">Back</Link></Container></>;
  }

  return (
    <>
      <NavBar />
      <Container className="py-5">
        <Link to="/dashboard" className="btn btn-outline-light mb-4">← Dashboard</Link>
        <h1 className="text-white mb-4">{terrarium.name}</h1>

        <Row>
          {/* Controls Panel */}
          <Col md={6} className="mb-4">
            <Card bg="dark" text="white" className="h-100 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <Form.Check
                  type="switch"
                  id="day-night-switch"
                  label={terrarium.day ? 'Day Mode' : 'Night Mode'}
                  checked={terrarium.day}
                  onChange={() => handleDaySwitch(!terrarium.day)}
                />
                <Button
                  size="sm"
                  variant="outline-light"
                  onClick={() => handleGenericUpdate({ manual_mode: !terrarium.manual_mode })}
                >
                  {terrarium.manual_mode ? '→ Automatic' : '→ Manual'}
                </Button>
              </Card.Header>
              <Card.Body>
                {terrarium.manual_mode
                  ? <ManualControlPanel terrarium={terrarium} setTerrarium={setTerrarium} token={token} />
                  : <AutomaticSettingsPanel terrarium={terrarium} onUpdate={handleGenericUpdate} />
                }
              </Card.Body>
            </Card>
          </Col>

          {/* Readings Panel */}
          <Col md={6} className="mb-4">
            <Card bg="dark" text="white" className="h-100 shadow-sm">
              <Card.Header>Recent Readings</Card.Header>
              <Card.Body className="p-0">
                {readings.length === 0
                  ? <div className="p-3 text-center">No readings.</div>
                  : (
                    <Table
                      variant="dark"
                      hover
                      responsive
                      className="mb-0"
                      style={{ maxHeight: 400, overflowY: 'auto', display: 'block' }}
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
}
