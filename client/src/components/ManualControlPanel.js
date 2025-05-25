import { Form } from 'react-bootstrap';

export default function ManualControlPanel({ terrarium, onUpdate }) {
  const devices = [
    { field: 'heater_enabled',    label: 'Heater'    },
    { field: 'sprinkler_enabled', label: 'Sprinkler' },
    { field: 'leds_enabled',      label: 'LEDs'      },
  ];

  return (
    <Form className="d-flex flex-column gap-3">
      {devices.map(({ field, label }) => (
        <Form.Check
          key={field}
          type="switch"
          id={field}
          label={label}
          checked={terrarium[field]}
          onChange={() => onUpdate({ [field]: !terrarium[field] })}
        />
      ))}
    </Form>
  );
}
