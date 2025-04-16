import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5050',
    withCredentials: true,
});

  
export const login = async(data) => {
    const email = data.email;
    const password = data.password;
    const response = await api.post('/login', { email, password });
    return response.data;
};

export const register = async(data) => {
    const name = data.name;
    const email = data.email;
    const password = data.password;
    const response = await api.post('/register', { name, email, password });
    return response.data;
};