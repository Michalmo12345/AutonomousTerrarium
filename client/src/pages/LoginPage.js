import { Button, Form, Container } from 'react-bootstrap';

const LoginPage = () => {
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="form-container" style={{ width: '400px' }}>
        <h2 className="text-white mb-4">Welcome Back</h2>
        <Form>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label className="text-white">Email address</Form.Label>
            <Form.Control type="email" placeholder="Enter your email" className="bg-dark text-white border-light" />
          </Form.Group>
          <Form.Group className="mb-4" controlId="password">
            <Form.Label className="text-white">Password</Form.Label>
            <Form.Control type="password" placeholder="Enter your password" className="bg-dark text-white border-light" />
          </Form.Group>
          <Button variant="dark" className="w-100">
            Log In
          </Button>
        </Form>
        <div className="text-center mt-3">
          <small className="text-light">Don't have an account? <a href="/register" className="signup-link">Sign up</a></small>
        </div>
      </div>
    </Container>
  );
};

export default LoginPage;
