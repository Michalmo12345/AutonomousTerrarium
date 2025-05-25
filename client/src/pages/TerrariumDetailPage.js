import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Form } from 'react-bootstrap';

const API_BASE = 'http://13.60.201.150:5000/api'

const TerrariumDetailPage = () => {
  const { id } = useParams();

  const [terrarium, setTerrarium] = useState(null);
  const [latestReading, setLatestReading] = useState(null);
  const [mode, setMode] = useState('manual');
  const [formState, setFormState] = useState({
    leds: false,
    heating: false,
    sprinkler: false,
    dayTemp: '',
    nightTemp: '',
    dayHumidity: '',
    nightHumidity: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch terrarium and latest reading on mount or id change
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const resTerrarium = await fetch(`${API_BASE}/${id}`);
        if (!resTerrarium.ok) throw new Error('Failed to fetch terrarium');
        const terrariumData = await resTerrarium.json();

        setTerrarium(terrariumData);
        setMode(terrariumData.manual_mode ? 'manual' : 'automatic');
        setFormState({
          leds: terrariumData.leds || false,
          heating: terrariumData.heating || false,
          sprinkler: terrariumData.sprinkler || false,
          dayTemp: terrariumData.day_temp || '',
          nightTemp: terrariumData.night_temp || '',
          dayHumidity: terrariumData.day_humidity || '',
          nightHumidity: terrariumData.night_humidity || ''
        });

        const resReading = await fetch(`${API_BASE}/${id}/latest-reading`);
        if (resReading.ok) {
          const readingData = await resReading.json();
          setLatestReading(readingData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // When mode changes, update backend manually via /manual-mode endpoint
  const handleModeChange = async (newMode) => {
    setMode(newMode);
    try {
      await fetch(`${API_BASE}/${id}/manual-mode`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manual_mode: newMode === 'manual' }),
      });
    } catch {
      setError('Failed to update mode');
    }
  };

  // Handle toggle for manual devices: update immediately
  const handleManualToggle = async (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    try {
      await fetch(`${API_BASE}/${id}/manual-devices`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [field]: value
        }),
      });
    } catch {
      setError('Failed to update manual device');
    }
  };

  // Handle changes in automatic mode inputs (no backend call yet)
  const handleAutomaticChange = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  // Save button handler in automatic mode
  const handleSaveAutomatic = async () => {
    setIsSaving(true);
    try {
      await fetch(`${API_BASE}/${id}/automatic-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day_temp: formState.dayTemp,
          night_temp: formState.nightTemp,
          day_humidity: formState.dayHumidity,
          night_humidity: formState.nightHumidity
        }),
      });
    } catch {
      setError('Failed to save automatic settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Container><p>Loading...</p></Container>;
  if (error) return <Container><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="py-5 text-white">
      <Link to="/dashboard" className="btn btn-outline-light mb-3">← Back to Dashboard</Link>

      <h1 className="mb-4">{terrarium.name}</h1>

      <Form.Group className="mb-3" controlId="modeSelect">
        <Form.Label>Mode</Form.Label>
        <Form.Select 
          value={mode} 
          onChange={e => handleModeChange(e.target.value)} 
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
            onChange={e => handleManualToggle('leds', e.target.checked)}
            className="mb-2"
          />
          <Form.Check 
            type="switch"
            label="Heating"
            checked={formState.heating}
            onChange={e => handleManualToggle('heating', e.target.checked)}
            className="mb-2"
          />
          <Form.Check 
            type="switch"
            label="Sprinkler"
            checked={formState.sprinkler}
            onChange={e => handleManualToggle('sprinkler', e.target.checked)}
            className="mb-4"
          />
          {/* No Save button in manual mode */}
        </>
      ) : (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Day Temperature (°C)</Form.Label>
            <Form.Control
              type="number"
              value={formState.dayTemp}
              onChange={e => handleAutomaticChange('dayTemp', e.target.value)}
              className="bg-dark text-white border-light"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Night Temperature (°C)</Form.Label>
            <Form.Control
              type="number"
              value={formState.nightTemp}
              onChange={e => handleAutomaticChange('nightTemp', e.target.value)}
              className="bg-dark text-white border-light"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Day Humidity (%)</Form.Label>
            <Form.Control
              type="number"
              value={formState.dayHumidity}
              onChange={e => handleAutomaticChange('dayHumidity', e.target.value)}
              className="bg-dark text-white border-light"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Night Humidity (%)</Form.Label>
            <Form.Control
              type="number"
              value={formState.nightHumidity}
              onChange={e => handleAutomaticChange('nightHumidity', e.target.value)}
              className="bg-dark text-white border-light"
            />
          </Form.Group>

          <Button 
            variant="primary" 
            onClick={handleSaveAutomatic} 
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </>
      )}

      <hr className="my-4" />

      <h4>Current State</h4>
      <p><strong>Temperature:</strong> {terrarium.temperature}°C</p>
      <p><strong>Humidity:</strong> {terrarium.humidity}%</p>

      {latestReading && (
        <>
          <h5>Latest Sensor Reading</h5>
          <p><strong>Temperature:</strong> {latestReading.temperature}°C</p>
          <p><strong>Humidity:</strong> {latestReading.humidity}%</p>
          <p><strong>Time:</strong> {new Date(latestReading.created_at).toLocaleString()}</p>
        </>
      )}
    </Container>
  );
};

export default TerrariumDetailPage;
