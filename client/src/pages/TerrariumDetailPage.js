import { Container, Row, Col, Card, Spinner, Alert, Form, Button } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../authContext';
import axios from 'axios';

import ManualControlPanel from '../components/ManualControlPanel';
import AutomaticSettingsPanel from '../components/AutomaticSettingsPanel';
import ReadingStatusPanel from '../components/ReadingStatusPanel';
import ReadingChart from '../components/ReadingChart';
import NavBar from '../components/NavBar';

const BASE_URL = 'http://13.60.201.150:5000/api';
const REFRESH_INTERVAL = 5000; // milliseconds

export default function TerrariumDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [terrarium, setTerrarium] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch details and readings
  const fetchData = async () => {
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
  };

  useEffect(() => {
    if (!token) return navigate('/login');
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [id, token, navigate]);

  const handleDaySwitch = async (value) => {
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

  const handleModeSwitch = async (value) => {
    try {
      const { data } = await axios.put(
        `${BASE_URL}/terrariums/${id}/manual-mode`,
        { manual_mode: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTerrarium(prev => ({ ...prev, manual_mode: data.manual_mode }));
    } catch (err) {
      setError(err.response?.data?.error || 'Mode switch failed');
    }
  };

  if (loading) return <><NavBar /><Container className="py-5 text-center"><Spinner animation="border"/></Container></>;
  if (error)   return <><NavBar /><Container className="py-5"><Alert variant="danger">{error}</Alert><Link to="/dashboard" className="btn btn-outline-light">Back</Link></Container></>;

  const latest = readings[0] || null;

  return (
    <>
      <NavBar />
      <Container className="py-5">
        <Link to="/dashboard" className="btn btn-outline-light mb-4">← Dashboard</Link>
        <h1 className="text-white mb-4">{terrarium.name}</h1>

        <Row>
          {/* Settings Panel */}
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
                  onClick={() => handleModeSwitch(!terrarium.manual_mode)}
                >
                  {terrarium.manual_mode ? '→ Automatic' : '→ Manual'}
                </Button>
              </Card.Header>
              <Card.Body>
                {terrarium.manual_mode
                  ? <ManualControlPanel terrarium={terrarium} setTerrarium={setTerrarium} token={token} />
                  : <AutomaticSettingsPanel terrarium={terrarium} id={id} token={token} setTerrarium={setTerrarium} />
                }
              </Card.Body>
            </Card>
          </Col>

          {/* Status Panel */}
          <Col md={6} className="mb-4">
            <ReadingStatusPanel latest={latest} />
          </Col>
        </Row>

        {/* Chart Panel */}
        <Row className="mt-4">
          <Col>
            <ReadingChart readings={readings} />
          </Col>
        </Row>
      </Container>
    </>
  );
}
