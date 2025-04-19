import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { register } from '../authService'; // Adjust the import path as needed

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      const token = await register(name, email, password);
      // Assuming your app stores the token (e.g., in context or localStorage)
      localStorage.setItem('token', token); // Example storage
      navigate('/dashboard'); // Redirect after success
    } catch (err) {
      setError('Registration failed. Email might already exist.');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="form-container" style={{ width: '400px' }}>
        <h2 className="text-white mb-4">Create Account</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label className="text-white">Full Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your full name"
              className="bg-dark text-white border-light"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label className="text-white">Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              className="bg-dark text-white border-light"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-4" controlId="password">
            <Form.Label className="text-white">Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Create your password"
              className="bg-dark text-white border-light"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <Button variant="dark" type="submit" className="w-100">
            Sign Up
          </Button>
        </Form>
        {error && <p className="text-danger mt-3">{error}</p>}
      </div>
    </Container>
  );
};

export default RegisterPage;