import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData
      );
      alert(response.data.message);
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Registration failed. Please try again.");
    }
  };

  // Styles
  const styles = {
    container: {
      maxWidth: "400px",
      margin: "3rem auto",
      padding: "2rem",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: "12px",
      backdropFilter: "blur(6px)",
      boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: "#222",
      textAlign: "center",
    },
    heading: {
      fontSize: "2rem",
      marginBottom: "1.5rem",
      fontWeight: "700",
    },
    input: {
      width: "100%",
      padding: "12px 14px",
      marginBottom: "1rem",
      borderRadius: "8px",
      border: "1.5px solid #ccc",
      backgroundColor: "transparent",
      color: "#222",
      fontSize: "1rem",
      outline: "none",
      boxSizing: "border-box",
      transition: "border-color 0.3s ease",
    },
    inputFocus: {
      borderColor: "#2563eb",
      boxShadow: "0 0 5px rgba(37, 99, 235, 0.6)",
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#2563eb",
      border: "none",
      borderRadius: "8px",
      color: "#fff",
      fontWeight: "700",
      fontSize: "1rem",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    },
    buttonHover: {
      backgroundColor: "#1e40af",
    },
  };

  // Focus & hover states
  const [focusName, setFocusName] = React.useState(false);
  const [focusEmail, setFocusEmail] = React.useState(false);
  const [focusPassword, setFocusPassword] = React.useState(false);
  const [btnHover, setBtnHover] = React.useState(false);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Register</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Username"
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          onFocus={() => setFocusName(true)}
          onBlur={() => setFocusName(false)}
          style={{
            ...styles.input,
            ...(focusName ? styles.inputFocus : {}),
          }}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          onFocus={() => setFocusEmail(true)}
          onBlur={() => setFocusEmail(false)}
          style={{
            ...styles.input,
            ...(focusEmail ? styles.inputFocus : {}),
          }}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          onFocus={() => setFocusPassword(true)}
          onBlur={() => setFocusPassword(false)}
          style={{
            ...styles.input,
            ...(focusPassword ? styles.inputFocus : {}),
          }}
          required
        />
        <button
          type="submit"
          style={{
            ...styles.button,
            ...(btnHover ? styles.buttonHover : {}),
          }}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
