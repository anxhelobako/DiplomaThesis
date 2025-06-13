import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FuelEfficiencyCalculator = () => {
  const [distance, setDistance] = useState('');
  const [fuelUsed, setFuelUsed] = useState('');
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const authHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
    withCredentials: true,
  });

  const fetchRecords = async () => {
    try {
      const response = await axios.get('/api/fuel-efficiency/user');
      setRecords(response.data.records);
      const { data } = await axios.get(
        'http://localhost:5000/api/auth/fuel_records',
        authHeaders()
      );
      /* backend returns an array, not {records: [...] } */
      setRecords(
        data.map((r) => ({
          id: r.id,
          distance: r.distance,
          fuel_used: r.gasAdded || r.gas_added || 0,
          fuel_efficiency: r.kmPerLiter || r.km_per_liter,
        }))
      );
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const authCfg = {
  withCredentials: true,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  },
};

  const handleAddRecord = async (e) => {
    e.preventDefault();
    const efficiency = (distance / fuelUsed).toFixed(2);
    try {
      await axios.post('/api/fuel-efficiency', {
        distance,
        fuel_used: fuelUsed,
        fuel_efficiency: efficiency
      });
      await axios.post(
        'http://localhost:5000/api/auth/fuel_records',
        {
          distance: parseFloat(distance),
          kmPerLiter: parseFloat(efficiency),
          litersPer100km: ((fuelUsed / distance) * 100).toFixed(2),
          gasAdded: parseFloat(fuelUsed),
          // optional fields – backend allows null
          totalExpense: null,
          costPerKm: null,
          kmPerCurrency: null,
        },
        authCfg
      );
      setDistance('');
      setFuelUsed('');
      fetchRecords();
    } catch (error) {
      console.error('Error adding record:', error);
    }
  };

  const handleEditRecord = async (record) => {
    setEditingId(record.id);
    setDistance(record.distance);
    setFuelUsed(record.fuel_used);
  };

  const handleUpdateRecord = async (e) => {
    e.preventDefault();
    const efficiency = (distance / fuelUsed).toFixed(2);
    try {
      await axios.put(`/api/fuel-efficiency/${editingId}`, {
        distance,
        fuel_used: fuelUsed,
        fuel_efficiency: efficiency
      });
      await axios.put(
        `http://localhost:5000/api/auth/fuel_records/${editingId}`,
        {
          distance: parseFloat(distance),
          kmPerLiter: parseFloat(efficiency),
          litersPer100km: ((fuelUsed / distance) * 100).toFixed(2),
          gasAdded: parseFloat(fuelUsed),
          totalExpense: null,
          costPerKm: null,
          kmPerCurrency: null,
        },
        authHeaders()
      );
      setEditingId(null);
      setDistance('');
      setFuelUsed('');
      fetchRecords();
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  const handleDeleteRecord = async (id) => {
    try {
      await axios.delete(`/api/fuel-efficiency/${id}`);
       await axios.delete(
        `http://localhost:5000/api/auth/fuel_records/${id}`,
        authHeaders()
      );
      fetchRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Fuel Efficiency Calculator</h2>
      <form onSubmit={editingId ? handleUpdateRecord : handleAddRecord} className="mb-4">
        <input
          type="number"
          placeholder="Distance (km)"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          className="border p-2 mr-2"
          required
        />
        <input
          type="number"
          placeholder="Fuel Used (liters)"
          value={fuelUsed}
          onChange={(e) => setFuelUsed(e.target.value)}
          className="border p-2 mr-2"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {editingId ? 'Update' : 'Add'}
        </button>
      </form>

      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Distance (km)</th>
            <th className="p-2 border">Fuel Used (L)</th>
            <th className="p-2 border">Efficiency (km/L)</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td className="p-2 border">{record.distance}</td>
              <td className="p-2 border">{record.fuel_used}</td>
              <td className="p-2 border">{record.fuel_efficiency}</td>
              <td className="p-2 border">
                <button
                  onClick={() => handleEditRecord(record)}
                  className="text-blue-500 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteRecord(record.id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {/* ---------- Line chart -------------- */}
{records.length > 0 && (
  <div style={{ width: '100%', height: 300, marginTop: 32 }}>
    <ResponsiveContainer>
      <LineChart data={records}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="id" label={{ value: 'Entry', position: 'insideBottomRight' }} />
        <YAxis label={{ value: 'km/L', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="fuel_efficiency" name="km/L" />
      </LineChart>
    </ResponsiveContainer>
  </div>
)}
        </tbody>
      </table>
    </div>
  );
};

export default FuelEfficiencyCalculator;
