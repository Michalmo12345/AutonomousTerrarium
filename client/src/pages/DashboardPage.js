import { Container, Row, Col, Card } from 'react-bootstrap';

const DashboardPage = () => {
  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="text-white">Your Terrariums</h1>
        </Col>
      </Row>
      <Row>
        {/* Sample Terrarium Card */}
        <Col md={4}>
          <Card className="bg-dark text-white">
            <Card.Body>
              <Card.Title>Terrarium 1</Card.Title>
              <Card.Text>Temperature: 25°C</Card.Text>
              <Card.Text>Humidity: 60%</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="bg-dark text-white">
            <Card.Body>
              <Card.Title>Terrarium 2</Card.Title>
              <Card.Text>Temperature: 22°C</Card.Text>
              <Card.Text>Humidity: 55%</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;
