import React, { useState } from 'react';
import axios from 'axios';

const AddCarForm = ({ onCarAdded }) => {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    price: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);  // New state for success message

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null); // Reset success message before submitting

    try {
      const response = await axios.post('http://localhost:5000/api/cars', formData, {
        withCredentials: true  // Include cookies if using sessions
      });
      
      console.log('Car added:', response.data);
      if (onCarAdded) onCarAdded(response.data); // Notify parent component
      setFormData({ make: '', model: '', year: '', price: '' }); // Reset form
      setSuccessMessage(`Successfully added ${response.data.make} ${response.data.model}!`); // Set success message
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add car. Please try again.');
      console.error('Error adding car:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="car-form">
      <h2>Add New Car</h2>
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>} {/* Display success message */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="make"
          value={formData.make}
          onChange={handleChange}
          placeholder="Make (e.g., Toyota)"
          required
          disabled={loading}
        />
        <input
          type="text"
          name="model"
          value={formData.model}
          onChange={handleChange}
          placeholder="Model (e.g., Corolla)"
          required
          disabled={loading}
        />
        <input
          type="number"
          name="year"
          value={formData.year}
          onChange={handleChange}
          placeholder="Year (e.g., 2020)"
          min="1900"
          max={new Date().getFullYear()}
          required
          disabled={loading}
        />
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="Price (e.g., 15000)"
          min="0"
          step="1"
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Car'}
        </button>
      </form>
    </div>
  );
};

export default AddCarForm;
