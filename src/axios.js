import axios from "axios";

// const apiBaseURL = "http://192.168.0.103:5000";
// const apiBaseURL = "http://localhost:5000";
// const apiBaseURL = "http://127.0.0.1:5000";
const apiBaseURL = "http://172.16.20.60:5000";

export default axios.create({
    baseURL: apiBaseURL,
});