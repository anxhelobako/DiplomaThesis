// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import UsedCarFinder from './UsedCarFinder';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import CarModificationTracker from './CarModificationTracker';

/* GLOBAL CSS injection with vibrant style enhancements */
const injectDashboardStyles = (() => {
  let done = false;
  return () => {
    if (done) return;
    done = true;
    const style = document.createElement('style');
    style.innerHTML = `
      body {
        background: linear-gradient(to right, #0f172a, #1e293b);
      }
      .dash-container {
        max-width: 1280px;
        margin: 0 auto;
        padding: 2rem 1.5rem;
        color: #e5e7eb;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      
      }
      .dash-section-btn {
        padding: 0.75rem 1.25rem;
        border-radius: 0.75rem;
        background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%);
        color: #fff;
        font-weight: 600;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        border: none;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .dash-section-btn:hover {
        transform: scale(1.03);
        box-shadow: 0 8px 15px rgba(6, 182, 212, 0.4);
      }
      .dash-section-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transition: left 0.5s ease;
      }
      .dash-section-btn:hover::before {
        left: 100%;
      }
      .dash-section-btn.dash-active {
        background: linear-gradient(90deg, #8b5cf6 0%, #06b6d4 100%);
        box-shadow: 0 0 20px rgba(139, 92, 246, 0.6);
      }
      .dash-card {
        background: rgba(17, 24, 39, 0.7);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 1rem;
        padding: 1.5rem;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        margin-bottom: 2rem;
      }
      .dash-form label {
        display: block;
        margin-bottom: 0.25rem;
        font-weight: 600;
      }
      .dash-form input {
        width: 100%;
        padding: 0.6rem 0.8rem;
        border-radius: 0.5rem;
        background: rgba(31, 41, 55, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #f9fafb;
        font-size: 0.9rem;
        margin-bottom: 0.75rem;
        outline: none;
        transition: border 0.2s ease, background 0.2s ease;
      }
      .dash-form input:focus {
        border-color: #10b981;
        background: rgba(31, 41, 55, 0.8);
      }
      .dash-primary-btn {
        padding: 0.75rem 1.5rem;
        border-radius: 0.75rem;
        background: linear-gradient(to right, #10b981, #3b82f6);        color: #ffffff;
        font-weight: 700;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .dash-primary-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.5);
      }
      .dash-secondary-btn {
        padding: 0.75rem 1.25rem;
        border-radius: 0.75rem;
        background: rgba(59, 130, 246, 0.15);
        color: #ffffff;
        border: 1px solid rgba(59, 130, 246, 0.4);
        cursor: pointer;
        font-weight: 600;
        margin-left: 0.75rem;
        transition: background 0.2s ease, box-shadow 0.2s ease;
      }
      .dash-secondary-btn:hover {
        background: rgba(59, 130, 246, 0.25);
        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
      }
      .dash-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.75rem;
        overflow: hidden;
        font-size: 0.9rem;
        color: #f9fafb; 
    }
      .dash-table th, .dash-table td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        text-align: left;
      }
      .dash-table th {
        background: linear-gradient(to right, #8b5cf6, #06b6d4);        
        color: #ffffff;
        font-weight: 700;
      }
      .dash-table tr:nth-child(even) {
        background: rgba(255, 255, 255, 0.03);
      }
      .dash-table tr:hover {
        background: rgba(255, 255, 255, 0.08);
      }
    `;
    document.head.appendChild(style);
  };
})();


/* ------------------------------------------------------------------ */
/*  Axios helper                                                      */
/* ------------------------------------------------------------------ */
const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
});

/* tiny formatter */
const fmt = (n, d = 2) =>
  n !== undefined && n !== null ? Number(n).toFixed(d) : 'N/A';

export default function Dashboard({ user }) {
  injectDashboardStyles();

  /* ---------------------------- state ---------------------------- */
  const [activeSection, setActiveSection] = useState('calculator');
  const [favorites, setFavorites] = useState([]);
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [inputs, setInputs] = useState({
    currentOdometer: '',
    previousOdometer: '',
    gasAdded: '',
    gasPrice: '',
  });

  const [result, setResult] = useState(null);
  const location = useLocation();

  /* ------------ load favorites & records once user present -------- */
  useEffect(() => {
   if (!user) return;
  const load = async () => {
    try {
      const [favRes, recRes] = await Promise.all([
        api.get('/api/auth/my_dummy_favorites'),   // ✅ dummy favorites
        api.get('/api/auth/fuel_records'),         // ✅ real fuel records
      ]);
      setFavorites(favRes.data);
      setRecords(recRes.data);
    } catch (err) {
      console.error('initial fetch failed', err);
    }
  };
  load();
}, [user, location]);

  /* ---------------------- input helpers ------------------------- */
  const handleChange = (e) =>
    setInputs({ ...inputs, [e.target.name]: e.target.value });

  const resetForm = () =>
    setInputs({
      currentOdometer: '',
      previousOdometer: '',
      gasAdded: '',
      gasPrice: '',
    });

  /* ------------------- save / update record --------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const current = parseFloat(inputs.currentOdometer);
    const previous = parseFloat(inputs.previousOdometer);
    const gas = parseFloat(inputs.gasAdded);
    const price = parseFloat(inputs.gasPrice || 0);

    if ([current, previous, gas].some(isNaN) || gas <= 0 || current <= previous) {
      alert('Check your numbers (current > previous & gas > 0).');
      return;
    }

    const distance = current - previous;
    const kmPerLiter = distance / gas;
    const litersPer100km = (gas / distance) * 100;
    const totalExpense = price ? gas * price : null;
    const costPerKm = price ? totalExpense / distance : null;
    const kmPerCurrency = price ? distance / totalExpense : null;

    const payload = {
      distance,
      kmPerLiter,
      litersPer100km,
      totalExpense,
      costPerKm,
      kmPerCurrency,
      gasAdded: gas,
    };

    /* optimistic UI */
    let localTmp = { id: editingId || Date.now(), ...payload };
    setRecords((r) =>
      editingId ? r.map((v) => (v.id === editingId ? localTmp : v)) : [...r, localTmp]
    );

    /* send to backend */
    try {
      if (editingId) {
        const { data } = await api.put(`/api/auth/fuel_records/${editingId}`, payload);
        setRecords((r) => r.map((v) => (v.id === editingId ? data : v)));
        setEditingId(null);
      } else {
        const { data } = await api.post('/api/auth/fuel_records', payload);
        setRecords((r) => r.map((v) => (v.id === localTmp.id ? data : v)));
      }
    } catch (err) {
      console.error('save failed', err);
      alert('Could not save record.');
      try {
        const { data } = await api.get('/api/auth/fuel_records');
        setRecords(data);
      } catch {}
    }

    setResult(payload);
    resetForm();
  };

  /* ------------------------- delete ----------------------------- */
  const handleDelete = async (id) => {
    setRecords((r) => r.filter((v) => v.id !== id));
    try {
      await api.delete(`/api/auth/fuel_records/${id}`);
    } catch (err) {
      console.error('delete failed', err);
      alert('Could not delete record.');
      const { data } = await api.get('/api/auth/fuel_records');
      setRecords(data);
    }
  };

  /* ---------------------- Section Button ------------------------ */
  const SectionButton = ({ id, children }) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`nav-link-hover dash-section-btn ${activeSection === id ? 'dash-active' : ''}`}
      style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
    >
      {children}
    </button>
  );

  /* --------------------------- UI ------------------------------ */
  return (
    <div className="dash-container">
      <h1 className="nav-gradient-text" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem', color: '#ffffff', textshadow: '0 0 10px rgba(255, 255, 255, 0.3)' }}>
        Dashboard
      </h1>

      {/* ------------ Navigation bar ------------- */}
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <SectionButton id="calculator">Fuel Calculator</SectionButton>
        <SectionButton id="records">Records</SectionButton>
        <SectionButton id="chart">Chart</SectionButton>
        <SectionButton id="favorites">Favorites</SectionButton>
        <SectionButton id="used">Used‑Car Finder</SectionButton>
        <SectionButton id="modtracker">Car Modification Tracker</SectionButton>
      </div>

      

      {/* ------------ Fuel Calculator ------------- */}
      {activeSection === 'calculator' && (
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2 className="nav-gradient-text" style={{ marginBottom: '1rem', color: '#ffffff', textShadow: '0 0 10px rgba(255, 255, 255, 0.3)' }}>Fuel Efficiency Calculator</h2>
          <form onSubmit={handleSubmit} className="dash-form">
            {[
              { name: 'currentOdometer', label: 'Current Odometer (km)' },
              { name: 'previousOdometer', label: 'Previous Odometer (km)' },
              { name: 'gasAdded', label: 'Gas Added (L)' },
              { name: 'gasPrice', label: 'Gas Price €/L (opt)' },
            ].map(({ name, label }) => (
              <div key={name}>
                <label>{label}</label>
                <input
                  type="number"
                  name={name}
                  value={inputs[name]}
                  onChange={handleChange}
                  required={name !== 'gasPrice'}
                  min="0"
                  step="any"
                />
              </div>
            ))}
            <div style={{ marginTop: '1rem' }}>
              <button type="submit" className="dash-primary-btn">
                {editingId ? 'Update Record' : 'Calculate'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    resetForm();
                  }}
                  className="dash-secondary-btn"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {result && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Result</h3>
              <p>Distance: <strong>{fmt(result.distance)}</strong> km</p>
              <p>Efficiency: <strong>{fmt(result.kmPerLiter)}</strong> km/L</p>
              <p>Consumption: <strong>{fmt(result.litersPer100km)}</strong> L/100km</p>
              {result.totalExpense && (
                <>
                  <p>Cost: <strong>{fmt(result.totalExpense)}</strong> €</p>
                  <p>Cost/km: <strong>{fmt(result.costPerKm, 4)}</strong></p>
                  <p>Km per €: <strong>{fmt(result.kmPerCurrency)}</strong></p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ------------ Records table --------------- */}
      {activeSection === 'records' && records.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h3 className="nav-gradient-text" style={{ marginBottom: '1rem', color: '#ffffff', textShadow: '0 0 10px rgba(255, 255, 255, 0.3)' }}>Saved Records</h3>
          <table className="dash-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Distance</th>
                <th>L Added</th>
                <th>km/L</th>
                <th>L/100km</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr key={r.id}>
                  <td>{idx + 1}</td>
                  <td>{fmt(r.distance)}</td>
                  <td>{fmt(r.gasAdded)}</td>
                  <td>{fmt(r.kmPerLiter)}</td>
                  <td>{fmt(r.litersPer100km)}</td>
                  <td>
                    <button
                      onClick={() => {
                        setEditingId(r.id);
                        setInputs({
                          currentOdometer: '',
                          previousOdometer: '',
                          gasAdded: r.gasAdded,
                          gasPrice: '',
                        });
                        setActiveSection('calculator');
                        setResult(r);
                      }}
                      className="dash-secondary-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="dash-secondary-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ------------ Chart ----------------------- */}
      {activeSection === 'chart' && records.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h3 className="nav-gradient-text" style={{ marginBottom: '1rem', color: '#ffffff', textShadow: '0 0 10px rgba(255, 255, 255, 0.3)' }}>Fuel Efficiency vs Consumption</h3>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={records} margin={{ top: 20, right: 50, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="id"
                tick={{ fontSize: 12, fill: '#e5e7eb' }}
                label={{ value: 'Record #', position: 'insideBottom', offset: -4, fill: '#e5e7eb' }}
              />
              <YAxis
                yAxisId="left"
                label={{ value: 'km per Liter', angle: -90, position: 'insideLeft', fill: '#e5e7eb' }}
                tick={{ fontSize: 12, fill: '#e5e7eb' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: 'Liters per 100 km', angle: -90, position: 'insideRight', fill: '#e5e7eb' }}
                tick={{ fontSize: 12, fill: '#e5e7eb' }}
              />
              <Tooltip formatter={(v) => Number(v).toFixed(2)} contentStyle={{ background: '#1f2937', border: 'none' }} />
              <Legend verticalAlign="top" height={24} wrapperStyle={{ color: '#e5e7eb' }} />
              <Line yAxisId="left" type="monotone" dataKey="kmPerLiter" name="Efficiency (km/L)" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line yAxisId="right" type="monotone" dataKey="litersPer100km" name="Consumption (L/100 km)" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

    {/* ------------ Favorites ------------------- */}
{activeSection === 'favorites' && favorites.length > 0 && (
  <div className="bg-white p-4 rounded-xl shadow-md">
    <h3
      className="nav-gradient-text"
      style={{
        marginBottom: '1rem',
        color: '#ffffff',
        textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
      }}
    >
      Your Favorite Cars
    </h3>
    <table className="dash-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Make</th>
          <th>Model</th>
          <th>Year</th>
          <th>Fuel</th>
          <th>Price</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {favorites.map((car) => (
          <tr key={car.id}>
            <td>{car.id}</td>
            <td>{car.make}</td>
            <td>{car.model}</td>
            <td>{car.year}</td>
            <td>{car.fuel_type}</td>
            <td>{car.price}</td>
            <td>
              <button
                onClick={async () => {
                  try {
                    await api.delete(`/api/auth/remove_dummy_favorite/${car.id}`);
                    setFavorites((f) => f.filter((c) => c.id !== car.id));
                  } catch {
                    alert('Could not remove car.');
                  }
                }}
                className="dash-secondary-btn"
              >
                Remove
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}


      {/* ------------ Used‑Car Finder ------------- */}
      {activeSection === 'used' && (
        <div className="bg-white p-4 rounded-xl shadow-md">
          <UsedCarFinder />
        </div>
      )}

      {/* ------------ Car Modification Tracker ------------- */}
      {activeSection === 'modtracker' && (
        <div className="bg-white p-4 rounded-xl shadow-md">
          <CarModificationTracker />
        </div>
      )}
    </div>
  );
}
