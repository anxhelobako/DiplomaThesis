import React, { useState } from "react";
import axios from "axios";

const CarModificationTracker = () => {
  const [car, setCar] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setError("");
    setResults(null);

    const [make, ...rest] = car.split(" ");
    const model = rest.join(" ");

    try {
      const res = await axios.get(`http://localhost:5000/api/modifications`, {
        params: { make, model },
      });
      if (Object.keys(res.data).length === 0) {
        setError("No modifications found for this car.");
      } else {
        setResults(res.data);
      }
    } catch (err) {
      setError("Error fetching modifications.");
      console.error(err);
    }
  };

  // Inline styles object
  const styles = {
    container: {
      padding: "1rem",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: "#222",
      maxWidth: "900px",
      margin: "0 auto",
    },
    heading: {
      fontSize: "1.8rem",
      fontWeight: "600",
      marginBottom: "1rem",
      textAlign: "center",
    },
    input: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: "6px",
      border: "1.5px solid #ccc",
      outline: "none",
      fontSize: "1rem",
      backgroundColor: "transparent",
      color: "#222",
      boxSizing: "border-box",
    },
    button: {
      marginTop: "10px",
      padding: "10px 16px",
      backgroundColor: "#2563eb", // blue-600
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "600",
      width: "100%",
      fontSize: "1rem",
    },
    error: {
      marginTop: "1rem",
      color: "#dc2626", // red-600
      fontWeight: "600",
      textAlign: "center",
    },
    categoryTitle: {
      fontSize: "1.4rem",
      fontWeight: "700",
      marginBottom: "0.75rem",
      color: "#111",
      borderBottom: "2px solid #2563eb",
      paddingBottom: "4px",
    },
    modsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "1rem",
    },
    modCard: {
      padding: "1rem",
      borderRadius: "12px",
      border: "1px solid #e5e7eb",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(4px)",
      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      cursor: "default",
    },
    modImageWrapper: {
      width: "100%",
      paddingTop: "75%", // 4:3 aspect ratio
      position: "relative",
      overflow: "hidden",
      borderRadius: "8px",
      marginBottom: "0.5rem",
      boxShadow: "0 0 8px rgba(0,0,0,0.15)",
      backgroundColor: "#fff",
    },
    modImage: {
      position: "absolute",
      top: "50%",
      left: "50%",
      width: "auto",
      height: "100%",
      transform: "translate(-50%, -50%)",
      objectFit: "contain",
      transition: "transform 0.3s ease",
    },
    modImageHover: {
      transform: "translate(-50%, -50%) scale(1.05)",
    },
    modName: {
      color: "#333",
      fontWeight: "500",
      fontSize: "1rem",
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Car Modification Tracker</h2>

      <input
        type="text"
        placeholder="Enter car make and model (e.g., BMW M3)"
        style={styles.input}
        value={car}
        onChange={(e) => setCar(e.target.value)}
      />
      <button onClick={handleSearch} style={styles.button}>
        Search Modifications
      </button>

      {error && <p style={styles.error}>{error}</p>}

      {results &&
        Object.entries(results).map(([category, mods]) => (
          <div key={category} style={{ marginBottom: "2rem" }}>
            <h3 style={styles.categoryTitle}>{category}</h3>
            <div style={styles.modsGrid}>
              {mods.map((mod, index) => (
                <div
                  key={index}
                  style={styles.modCard}
                  onMouseEnter={e => {
                    const img = e.currentTarget.querySelector('img');
                    if (img) img.style.transform = styles.modImageHover.transform;
                  }}
                  onMouseLeave={e => {
                    const img = e.currentTarget.querySelector('img');
                    if (img) img.style.transform = styles.modImage.transform;
                  }}
                >
                  <div style={styles.modImageWrapper}>
                    <img
                      src={mod.image}
                      alt={mod.name}
                      style={styles.modImage}
                    />
                  </div>
                  <p style={styles.modName}>{mod.name}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default CarModificationTracker;
