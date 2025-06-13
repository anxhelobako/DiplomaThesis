import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const CarDetails = () => {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/cars/${id}`, { withCredentials: true })
      .then(res => setCar(res.data))
      .catch(err => {
        console.error('Failed to load car:', err);
        setError('Car not found.');
      });
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!car) return <p>Loading...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Car Details</h2>
      <p><strong>Make:</strong> {car.make}</p>
      <p><strong>Model:</strong> {car.model}</p>
      <p><strong>Year:</strong> {car.year}</p>
      <p><strong>Price (€):</strong> {car.price}</p>

      <Link to="/">← Back to Home</Link>
    </div>
  );
};

export default CarDetails;
//               <td>{car.make}</td>