import { Button, Form, Container } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../authService';
import { useAuth } from '../authContext';
import NavBar from '../components/NavBar';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login: setAuthToken } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await login(email, password);
      setAuthToken(token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <>
      <NavBar />
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
        <div className="form-container" style={{ width: '400px' }}>
          <h2 className="text-white mb-4">Welcome Back</h2>
          {error && <p className="text-danger">{error}</p>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label className="text-white">Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-dark text-white border-light"
              />
            </Form.Group>
            <Form.Group className="mb-4" controlId="password">
              <Form.Label className="text-white">Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-dark text-white border-light"
              />
            </Form.Group>
            <Button variant="dark" type="submit" className="w-100">
              Log In
            </Button>
          </Form>
          <div className="text-center mt-3">
            <small className="text-light">
              Don't have an account? <a href="/register" className="signup-link">Sign up</a>
            </small>
          </div>
        </div>
      </Container>
    </>
  );
};

export default LoginPage;