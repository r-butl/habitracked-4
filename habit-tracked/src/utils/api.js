import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5050',
    withCredentials: true,
});

export const getProfile = async () => {
    const response = await api.get('/profile');
    return response.data;
};

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

export const createHabit = async (userId, habitData) => {
    const response = await api.post('/habits/create', {
      userId,
      ...habitData
    });
    return response.data;
  };

export const deleteHabit = async (habitId) => {
    const response = await api.delete(`/habits/${habitId}/deleteHabit`);
    return response.data;
  };

export const updateHabit = async (habitId, updatedHabit) => {
  const response = await api.patch(`/habits/${habitId}/updateHabit`, updatedHabit);
  return response.data;
};
  
export const getUserHabits = async (userId) => {
    const response = await api.get(`/habits?userId=${userId}`);
    return response.data;
};

export const getCuratedHabits = async() => {
    const response = await api.get('/curatedHabits');
    return await response.data;
};

export const getLogs = async (habitId, startDate, endDate) => {

    const response = await api.get(`/habits/${habitId}/getLogs`, { startDate, endDate });
    return response.data;
};

export const createLog = async (habitId, duration) => {
    try{ 
        const response = await api.post(`habits/${habitId}/createLog`,{
            duration: parseInt(duration)
        });
        return response.data;
    }
    catch (error) {
        console.error("Error creating log:", error);
        throw error;
    }   
}