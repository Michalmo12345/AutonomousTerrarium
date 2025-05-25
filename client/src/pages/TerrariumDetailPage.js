import { Container, Row, Col, Button, Spinner, Alert, Card } from 'react-bootstrap';
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

  // fetch terrarium settings + readings
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const { data: t } = await axios.get(
          `${BASE_URL}/terrariums/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTerrarium(t);

        const { data: r } = await axios.get(
          `${BASE_URL}/readings/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReadings(r);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Not authorized — please log in again.');
          navigate('/login');
        } else {
          setError(err.response?.data?.error || 'Failed to load data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [id, token, navigate]);

  // generic updater for any terrarium field
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

  if (isLoading) {
    return (
      <>
        <NavBar />
        <Container className="py-5 text-center">
          <Spinner animation="border" />
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

  return (
    <>
      <NavBar />
      <Container className="py-5">
        <Link to="/dashboard" className="btn btn-outline-light mb-4">← Back to Dashboard</Link>
        <h1 className="text-white mb-4">{terrarium.name}</h1>

        <Row>
          {/* Left: Controls */}
          <Col lg={6} className="mb-4">
            <Card className="p-4 bg-dark text-white h-100">
              <div className="d-flex justify-content-between mb-3">
                <h4>Mode: {terrarium.manual_mode ? 'Manual' : 'Automatic'}</h4>
                <Button
                  size="sm"
                  onClick={() => handleUpdate({ manual_mode: !terrarium.manual_mode })}
                >
                  Switch to {terrarium.manual_mode ? 'Automatic' : 'Manual'}
                </Button>
              </div>
              {terrarium.manual_mode
                ? <ManualControlPanel terrarium={terrarium} onUpdate={handleUpdate} />
                : <AutomaticSettingsPanel terrarium={terrarium} onUpdate={handleUpdate} />
              }
            </Card>
          </Col>

          {/* Right: Readings */}
          <Col lg={6} className="mb-4">
            <Card className="p-4 bg-dark text-white h-100">
              <h4 className="mb-3">Recent Sensor Readings</h4>
              {readings.length === 0 ? (
                <p>No readings available.</p>
              ) : (
                <table className="table table-sm table-dark">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Temp (°C)</th>
                      <th>Hum (%)</th>
                      <th>Heater</th>
                      <th>Sprinkler</th>
                      <th>LEDs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readings.slice(0, 10).map(r => (
                      <tr key={r.id}>
                        <td>{new Date(r.created_at).toLocaleString()}</td>
                        <td>{Number(r.temperature).toFixed(1)}</td>
                        <td>{Number(r.humidity).toFixed(1)}</td>
                        <td>{r.heater_on ? 'On' : 'Off'}</td>
                        <td>{r.sprinkler_on ? 'On' : 'Off'}</td>
                        <td>{r.leds_on ? 'On' : 'Off'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default TerrariumDetailPage;