import { Button, Form, Container } from 'react-bootstrap';

const RegisterPage = () => {
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="form-container" style={{ width: '400px' }}>
        <h2 className="text-white mb-4">Create Account</h2>
        <Form>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label className="text-white">Full Name</Form.Label>
            <Form.Control type="text" placeholder="Enter your full name" className="bg-dark text-white border-light" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label className="text-white">Email address</Form.Label>
            <Form.Control type="email" placeholder="Enter your email" className="bg-dark text-white border-light" />
          </Form.Group>
          <Form.Group className="mb-4" controlId="password">
            <Form.Label className="text-white">Password</Form.Label>
            <Form.Control type="password" placeholder="Create your password" className="bg-dark text-white border-light" />
          </Form.Group>
          <Button variant="dark" className="w-100">
            Sign Up
          </Button>
        </Form>
        <div className="text-center mt-3">
          <small className="text-light">Already have an account? <a href="/login" className="signup-link">Log in</a></small>
        </div>
      </div>
    </Container>
  );
};

export default RegisterPage;
