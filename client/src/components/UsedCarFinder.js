import React, { useState } from 'react';
import axios from 'axios';

function UsedCarFinder() {
  const [filters, setFilters] = useState({ make: '', model: '', year: '' });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const searchCars = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/used_cars', { params: filters });
      console.log("Results from backend:", res.data);
      setResults(res.data);
    } catch (err) {
      console.error('Error fetching used cars:', err);
    }
    setLoading(false);
  };

  const styles = {
    container: { padding: '1rem' },
    heading: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#222' },
    filtersContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    input: {
      padding: '0.5rem',
      border: '1px solid #ccc',
      borderRadius: '8px',
      fontSize: '1rem',
      backgroundColor: 'transparent',
      color: '#111',
      outline: 'none',
    },
    button: {
      backgroundColor: '#2563eb',
      color: '#fff',
      padding: '0.6rem 1rem',
      border: 'none',
      borderRadius: '8px',
      fontWeight: 'bold',
      cursor: 'pointer',
    },
    card: {
      display: 'flex',
      gap: '1rem',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '1rem',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
      backgroundColor: 'rgba(255, 255, 255, 0.1)', // subtle transparent white
      backdropFilter: 'blur(4px)',
    },
    image: {
      width: '160px',
      height: '110px',
      objectFit: 'cover',
      borderRadius: '8px',
    },
    titleRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    carTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      color: '#222',
    },
    details: { marginBottom: '0.3rem', color: '#333' },
    favButton: {
      fontSize: '1.5rem',
      color: '#dc2626',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Used Car Finder</h2>

      {/* Filters */}
      <div style={styles.filtersContainer}>
        <input
          name="make"
          placeholder="Make (e.g. Audi)"
          onChange={handleChange}
          style={styles.input}
        />
        <input
          name="model"
          placeholder="Model (e.g. A3)"
          onChange={handleChange}
          style={styles.input}
        />
        <input
          name="year"
          placeholder="Year (e.g. 2012)"
          onChange={handleChange}
          style={styles.input}
        />
        <button onClick={searchCars} style={styles.button}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Results */}
      <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {results.map((car, index) => (
          <li key={index} style={styles.card}>
            {car.image && (
              <img
                src={car.image}
                alt={`${car.make} ${car.model}`}
                style={styles.image}
              />
            )}
            <div style={{ flex: 1 }}>
              <div style={styles.titleRow}>
                <h3 style={styles.carTitle}>
                  {car.make} {car.model}
                </h3>
                <button
                  onClick={async () => {
                    try {
                      await axios.post(
                        `http://localhost:5000/api/auth/add_dummy_favorite/${car.id}`
                      );
                      alert('Added to favorites!');
                    } catch (err) {
                      alert('Failed to add favorite');
                      console.error(err);
                    }
                  }}
                  style={styles.favButton}
                  title="Add to Favorites"
                >
                  ❤️
                </button>
              </div>
              <p style={styles.details}><strong>Year:</strong> {car.year || 'N/A'}</p>
              <p style={styles.details}><strong>Fuel Type:</strong> {car.fuel_type || 'N/A'}</p>
              <p style={styles.details}><strong>Price:</strong> €{car.price || 'N/A'}</p>
              <p style={styles.details}><strong>Location:</strong> {car.location || 'N/A'}</p>
              <p style={styles.details}><strong>Kilometres:</strong> {car.kilometres || 'N/A'}</p>
              <p style={styles.details}><strong>Description:</strong> {car.description || 'N/A'}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UsedCarFinder;
