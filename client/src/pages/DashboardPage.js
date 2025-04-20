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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editTemperature, setEditTemperature] = useState('');
  const [editHumidity, setEditHumidity] = useState('');
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

  const handleEdit = (terrarium) => {
    setEditId(terrarium.id);
    setEditName(terrarium.name);
    setEditTemperature(terrarium.temperature);
    setEditHumidity(terrarium.humidity);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    setError('');
    if (!editName || !editTemperature || !editHumidity) {
      setError('All fields are required for update');
      return;
    }
    try {
      const response = await axios.put(
        `http://localhost:5000/api/terrariums/${editId}`,
        {
          name: editName,
          temperature: Number(editTemperature),
          humidity: Number(editHumidity),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTerrariums(
        terrariums.map((terrarium) =>
          terrarium.id === editId ? response.data : terrarium
        )
      );
      setShowEditModal(false);
      setEditId(null);
      setEditName('');
      setEditTemperature('');
      setEditHumidity('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update terrarium');
    }
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await axios.delete(`http://localhost:5000/api/terrariums/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTerrariums(terrariums.filter((terrarium) => terrarium.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete terrarium');
    }
  };

  return (
    <>
      <NavBar />
      <Container className="py-4">
        <h1 className="text-white mb-4">Your Terrariums</h1>
        <Button
          variant="dark"
          className="mb-4"
          onClick={() => setShowAddModal(true)}
        >
          Add New Terrarium
        </Button>
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
            <Button variant="dark" onClick={handleCreate}>
              Create
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          centered
          dialogClassName="modal-dark"
        >
          <Modal.Header closeButton className="bg-dark text-white border-light">
            <Modal.Title>Edit Terrarium</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-dark text-white">
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-dark text-white border-light"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Temperature (°C)</Form.Label>
                <Form.Control
                  type="number"
                  value={editTemperature}
                  onChange={(e) => setEditTemperature(e.target.value)}
                  className="bg-dark text-white border-light"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Humidity (%)</Form.Label>
                <Form.Control
                  type="number"
                  value={editHumidity}
                  onChange={(e) => setEditHumidity(e.target.value)}
                  className="bg-dark text-white border-light"
                />
              </Form.Group>
              {error && <p className="text-danger">{error}</p>}
            </Form>
          </Modal.Body>
          <Modal.Footer className="bg-dark border-light">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="dark" onClick={handleUpdate}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
        <Row>
          {terrariums.length === 0 ? (
            <Col>
              <p className="text-white">No terrariums found.</p>
            </Col>
          ) : (
            terrariums.map((terrarium) => (
              <Col md={4} key={terrarium.id}>
                <Card className="text-white mb-3">
                  <Card.Body>
                    <Link to={`/terrariums/${terrarium.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Card.Title>{terrarium.name}</Card.Title>
                      <Card.Text>Temperature: {terrarium.temperature}°C</Card.Text>
                      <Card.Text>Humidity: {terrarium.humidity}%</Card.Text>
                    </Link>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleEdit(terrarium)}
                      className="me-2"
                    >
                      Update
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(terrarium.id)}
                    >
                      Delete
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Container>
    </>
  );
};

export default DashboardPage;