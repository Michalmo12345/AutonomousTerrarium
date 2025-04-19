import { Button, Form, Container } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../authService';
import { useAuth } from '../authContext';
import NavBar from '../components/NavBar';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login: setAuthToken } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    if (!email.includes('@')) {
      newErrors.email = 'Please enter a valid email address (must include @).';
    }
    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = await register(name, email, password);
      setAuthToken(token);
      navigate('/dashboard');
    } catch (err) {
      setErrors({ submit: 'Registration failed. Email might already be in use.' });
    }
  };

  return (
    <>
      <NavBar />
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
        <div className="form-container" style={{ width: '400px' }}>
          <h2 className="text-white mb-4">Create Account</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label className="text-white">Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-dark text-white border-light"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label className="text-white">Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-dark text-white border-light"
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-4" controlId="password">
              <Form.Label className="text-white">Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Create your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-dark text-white border-light"
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
            </Form.Group>
            <Button variant="dark" type="submit" className="w-100">
              Sign Up
            </Button>
            {errors.submit && <p className="text-danger mt-3">{errors.submit}</p>}
          </Form>
          <div className="text-center mt-3">
            <small className="text-light">
              Already have an account? <a href="/login" className="signup-link">Log in</a>
            </small>
          </div>
        </div>
      </Container>
    </>
  );
};

export default RegisterPage;