// src/pages/ProfilePage.js

import { useEffect, useState } from 'react';
import { Container, Card, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { useAuth } from '../authContext';
import axios from 'axios';
import NavBar from '../components/NavBar';

const BASE_URL = 'http://16.170.162.232:5000/api';

export default function ProfilePage() {
  const { token } = useAuth();
  const [terrariums, setTerrariums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTerrariums = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/terrariums`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTerrariums(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load terrariums');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchTerrariums();
    } else {
      setError('Not authenticated');
      setLoading(false);
    }
  }, [token]);

  if (loading) {
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
        </Container>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <Container className="py-5 text-white">
        <h1 className="mb-4">Stats</h1>
        {terrariums.length === 0 ? (
          <Alert variant="info">You have no terrariums yet.</Alert>
        ) : (
          <ListGroup variant="flush">
            {terrariums.map((t) => (
              <ListGroup.Item key={t.id} className="bg-dark text-white mb-2">
                <Card bg="dark" text="white" className="shadow-sm">
                  <Card.Body>
                    <Card.Title>{t.name}</Card.Title>
                    <Card.Text>
                      Day Temp: {t.day_temperature} °C | Night Temp: {t.night_temperature} °C | Humidity: {t.humidity}%
                    </Card.Text>
                  </Card.Body>
                </Card>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Container>
    </>
  );
}
