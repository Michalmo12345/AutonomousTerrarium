import { Button } from 'react-bootstrap';

export default function ManualControlPanel({ terrarium, onUpdate }) {
  const devices = [
    { field: 'heater_enabled', label: 'Heater' },
    { field: 'sprinkler_enabled', label: 'Sprinkler' },
    { field: 'leds_enabled', label: 'LEDs' },
  ];

  return (
    <div className="d-flex flex-column gap-2">
      {devices.map(({ field, label }) => (
        <Button
          key={field}
          variant={terrarium[field] ? 'success' : 'secondary'}
          onClick={() => onUpdate({ [field]: !terrarium[field] })}
        >
          {label}: {terrarium[field] ? 'On' : 'Off'}
        </Button>
      ))}
    </div>
  );
}
