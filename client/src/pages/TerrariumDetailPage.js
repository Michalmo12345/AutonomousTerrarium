import { Container, Row, Col, Card, Form, Button, Alert, Modal, ToggleButtonGroup, ToggleButton } from 'react-bootstrap'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../authContext'
import axios from 'axios'
import NavBar from '../components/NavBar'

const API_BASE = 'http://13.60.201.150:5000/api'

const TerrariumDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()

  const [terrarium, setTerrarium] = useState(null)
  const [mode, setMode] = useState('manual')
  const [manualSettings, setManualSettings] = useState({ led: false, heat: false, sprinkler: false })
  const [autoSettings, setAutoSettings] = useState({
    dayStart: '08:00',
    nightStart: '20:00',
    dayTemp: '',
    nightTemp: '',
    dayHumidity: '',
    nightHumidity: ''
  })
  const [latestReading, setLatestReading] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('Please log in to view this page.')
        navigate('/login')
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const [terrariumRes, readingsRes] = await Promise.all([
          axios.get(`${API_BASE}/terrariums/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/readings/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        ])

        setTerrarium(terrariumRes.data)
        setAutoSettings(prev => ({ ...prev, 
          dayTemp: terrariumRes.data.day_temperature,
          nightTemp: terrariumRes.data.night_temperature,
          dayHumidity: terrariumRes.data.day_humidity,
          nightHumidity: terrariumRes.data.night_humidity
        }))

        if (readingsRes.data.length > 0) setLatestReading(readingsRes.data[0])
      } catch (err) {
        handleError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, token, navigate])

  const handleError = (err) => {
    if (err.response) {
      if (err.response.status === 401 || err.response.status === 403) setError('You are not authorized to view this terrarium.')
      else setError(err.response.data?.error || 'Failed to load terrarium details')
    } else setError('Unable to connect to the server.')
  }

  const handleModeChange = (val) => setMode(val)

  const handleUpdate = async () => {
    try {
      const updated = mode === 'manual'
        ? { mode: 'manual', ...manualSettings }
        : { mode: 'automatic', ...autoSettings }

      await axios.put(`${API_BASE}/terrariums/${id}/settings`, updated, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setError('')
    } catch (err) {
      handleError(err)
    }
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/terrariums/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      navigate('/dashboard')
    } catch (err) {
      handleError(err)
      setShowDeleteModal(false)
    }
  }

  const renderManualForm = () => (
    <>
      {['led', 'heat', 'sprinkler'].map((device) => (
        <Form.Check
          key={device}
          type="switch"
          label={`Turn ${device} ${manualSettings[device] ? 'Off' : 'On'}`}
          checked={manualSettings[device]}
          onChange={() => setManualSettings(prev => ({ ...prev, [device]: !prev[device] }))}
          className="mb-3 text-white"
        />
      ))}
    </>
  )

  const renderAutoForm = () => (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Day Start Time</Form.Label>
        <Form.Control
          type="time"
          value={autoSettings.dayStart}
          onChange={(e) => setAutoSettings(prev => ({ ...prev, dayStart: e.target.value }))}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Night Start Time</Form.Label>
        <Form.Control
          type="time"
          value={autoSettings.nightStart}
          onChange={(e) => setAutoSettings(prev => ({ ...prev, nightStart: e.target.value }))}
        />
      </Form.Group>
      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label>Day Temperature (°C)</Form.Label>
            <Form.Control
              type="number"
              value={autoSettings.dayTemp}
              onChange={(e) => setAutoSettings(prev => ({ ...prev, dayTemp: e.target.value }))}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label>Night Temperature (°C)</Form.Label>
            <Form.Control
              type="number"
              value={autoSettings.nightTemp}
              onChange={(e) => setAutoSettings(prev => ({ ...prev, nightTemp: e.target.value }))}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label>Day Humidity (%)</Form.Label>
            <Form.Control
              type="number"
              value={autoSettings.dayHumidity}
              onChange={(e) => setAutoSettings(prev => ({ ...prev, dayHumidity: e.target.value }))}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label>Night Humidity (%)</Form.Label>
            <Form.Control
              type="number"
              value={autoSettings.nightHumidity}
              onChange={(e) => setAutoSettings(prev => ({ ...prev, nightHumidity: e.target.value }))}
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  )

  if (isLoading) {
    return (
      <>
        <NavBar />
        <Container className="py-5"><p className="text-white">Loading...</p></Container>
      </>
    )
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
    )
  }

  return (
    <>
      <NavBar />
      <Container className="py-5">
        <Link to="/dashboard" className="btn btn-outline-light mb-3">← Back to Dashboard</Link>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-white fw-bold mb-0">{terrarium.name}</h1>
          <div className="d-flex gap-2">
            <Button variant="primary" onClick={handleUpdate}>Save Settings</Button>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>Delete Terrarium</Button>
          </div>
        </div>

        <ToggleButtonGroup type="radio" name="mode" value={mode} onChange={handleModeChange} className="mb-4">
          <ToggleButton id="manual-btn" variant="outline-light" value="manual">Manual</ToggleButton>
          <ToggleButton id="auto-btn" variant="outline-light" value="automatic">Automatic</ToggleButton>
        </ToggleButtonGroup>

        <Card className="text-white mb-4">
          <Card.Body>
            <h3>{mode === 'manual' ? 'Manual Controls' : 'Automatic Settings'}</h3>
            <Form>{mode === 'manual' ? renderManualForm() : renderAutoForm()}</Form>
          </Card.Body>
        </Card>

        {latestReading && (
          <Card className="text-white">
            <Card.Body>
              <h4>Latest Reading</h4>
              <div>Temperature: {latestReading.temperature}°C</div>
              <div>Humidity: {latestReading.humidity}%</div>
              <div>Time: {new Date(latestReading.created_at).toLocaleString()}</div>
            </Card.Body>
          </Card>
        )}

        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered dialogClassName="modal-dark">
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
  )
}

export default TerrariumDetailPage
