import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Modal, Form } from 'react-bootstrap';
import NavBar from '../components/NavBar';
import { useAuth } from '../authContext';
import CurrentState from '../components/CurrentState';
import ModeForm from '../components/ModeForm';

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
    leds: false,
    heating: false,
    sprinkler: false,
    dayTemp: '',
    nightTemp: '',
    dayHumidity: '',
    nightHumidity: ''
  });

  useEffect(() => {
    const mockTerrarium = {
      name: 'My Terrarium',
      temperature: 23.5,
      humidity: 60,
      leds: true,
      heating: false,
      sprinkler: true,
      day_temp: 25,
      night_temp: 20,
      day_humidity: 60,
      night_humidity: 70
    };

    const mockReading = {
      temperature: 24,
      humidity: 65,
      created_at: new Date().toISOString()
    };

    setTerrarium(mockTerrarium);
    setLatestReading(mockReading);
    setFormState({
      leds: mockTerrarium.leds,
      heating: mockTerrarium.heating,
      sprinkler: mockTerrarium.sprinkler,
      dayTemp: mockTerrarium.day_temp,
      nightTemp: mockTerrarium.night_temp,
      dayHumidity: mockTerrarium.day_humidity,
      nightHumidity: mockTerrarium.night_humidity
    });
    setIsLoading(false);
  }, [id]);

  const handleDelete = () => {
    navigate('/dashboard');
  };

  const handleSubmit = () => {
    const updatedTerrarium = { ...terrarium, ...formState };
    setTerrarium(updatedTerrarium);
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
            <ModeForm mode={mode} setMode={setMode} formState={formState} handleChange={handleChange} />
          </Col>

          <Col md={6} className="mb-4">
            <CurrentState terrarium={terrarium} latestReading={latestReading} />
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
