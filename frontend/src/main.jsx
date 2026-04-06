// frontend/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import axios from "axios"; // Import axios

import "./index.css";
import "./styles/animations.css";

// Set default base URL for axios
axios.defaults.baseURL = "http://localhost:5005/api"; 

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
