import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../authContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const [terrariums, setTerrariums] = useState([]);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTerrariums = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/terrariums', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTerrariums(response.data);
      } catch (err) {
        console.error(err);
        navigate('/login'); // Redirect to login if token is invalid
      }
    };
    if (token) fetchTerrariums();
  }, [token, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="text-white">Your Terrariums</h1>
        </Col>
        <Col className="text-end">
          <Button variant="dark" onClick={handleLogout}>
            Logout
          </Button>
        </Col>
      </Row>
      <Row>
        {terrariums.map((terrarium) => (
          <Col md={4} key={terrarium.id}>
            <Card className="bg-dark text-white">
              <Card.Body>
                <Card.Title>{terrarium.name}</Card.Title>
                <Card.Text>Temperature: {terrarium.temperature}°C</Card.Text>
                <Card.Text>Humidity: {terrarium.humidity}%</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default DashboardPage;