import axios from "axios";

const api = axios.create({
  baseURL: "http://YOUR_LOCAL_IP:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;