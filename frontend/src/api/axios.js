import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5005/api", // Your backend API base URL
  withCredentials: true, // Important for sending cookies/tokens with requests
});

export default instance;
