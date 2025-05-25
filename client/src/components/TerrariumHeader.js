import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const TerrariumHeader = ({ name, onUpdate, onDelete }) => (
  <div className="mb-4">
    <Link to="/dashboard" className="btn btn-outline-light mb-3">← Back to Dashboard</Link>
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
      <h1 className="text-white display-5 fw-bold mb-0">{name}</h1>
      <div className="d-flex gap-2">
        <Button variant="primary" onClick={onUpdate}>Update Settings</Button>
        <Button variant="danger" onClick={onDelete}>Delete Terrarium</Button>
      </div>
    </div>
    <div className="gradient-underline mb-4"></div>
  </div>
);

export default TerrariumHeader;
