import { Container, Row, Col, Card, Form, Button, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../authContext';
import NavBar from '../components/NavBar';

const DashboardPage = () => {
  const [terrariums, setTerrariums] = useState([]);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState('');
  const [addTemperature, setAddTemperature] = useState('');
  const [addHumidity, setAddHumidity] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchTerrariums = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/terrariums', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTerrariums(response.data);
      } catch (err) {
        console.error('Error fetching terrariums:', err);
        setError('Failed to load terrariums');
      }
    };
    if (token) fetchTerrariums();
  }, [token]);

  const handleCreate = async () => {
    setError('');
    if (!addName || !addTemperature || !addHumidity) {
      setError('All fields are required');
      return;
    }
    try {
      const response = await axios.post(
        'http://localhost:5000/api/terrariums',
        { name: addName, temperature: Number(addTemperature), humidity: Number(addHumidity) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTerrariums([...terrariums, response.data]);
      setAddName('');
      setAddTemperature('');
      setAddHumidity('');
      setShowAddModal(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create terrarium');
    }
  };

  return (
    <>
      <NavBar />
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-white">Your Terrariums</h1>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
          >
            Add New Terrarium
          </Button>
        </div>
        
        {/* Add Terrarium Modal */}
        <Modal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          centered
          dialogClassName="modal-dark"
        >
          <Modal.Header closeButton className="bg-dark text-white border-light">
            <Modal.Title>Add New Terrarium</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-dark text-white">
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter terrarium name"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="bg-dark text-white border-light"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Temperature (°C)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter temperature"
                  value={addTemperature}
                  onChange={(e) => setAddTemperature(e.target.value)}
                  className="bg-dark text-white border-light"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Humidity (%)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter humidity"
                  value={addHumidity}
                  onChange={(e) => setAddHumidity(e.target.value)}
                  className="bg-dark text-white border-light"
                />
              </Form.Group>
              {error && <p className="text-danger">{error}</p>}
            </Form>
          </Modal.Body>
          <Modal.Footer className="bg-dark border-light">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate}>
              Create
            </Button>
          </Modal.Footer>
        </Modal>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <Row>
          {terrariums.length === 0 ? (
            <Col>
              <Card className="text-white text-center py-5 mb-4">
                <Card.Body>
                  <h4>No terrariums found</h4>
                  <p className="text-white">Create a new terrarium to get started</p>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowAddModal(true)}
                  >
                    Add Your First Terrarium
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ) : (
            terrariums.map((terrarium) => (
              <Col md={4} key={terrarium.id} className="mb-4">
                <Link to={`/terrariums/${terrarium.id}`} style={{ textDecoration: 'none' }}>
                  <Card className="text-white h-100 terrarium-card">
                    <Card.Body>
                      <Card.Title className="h4 mb-3">{terrarium.name}</Card.Title>
                      <div className="mb-2">
                        <span className="text-white">Temperature: </span>
                        <span className="text-white">{terrarium.temperature}°C</span>
                      </div>
                      <div>
                        <span className="text-white">Humidity: </span>
                        <span className="text-white">{terrarium.humidity}%</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
            ))
          )}
        </Row>
      </Container>
    </>
  );
};

export default DashboardPage;