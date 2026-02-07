import axios from 'axios';

export const getProjectProgress = async () => {
    const res = await axios.get('/api/analytics/projects');
    return res.data;
};

export const getTaskCompletionStats = async () => {
    const res = await axios.get('/api/analytics/tasks');
    return res.data;
};

export const getTimeUtilization = async () => {
    const res = await axios.get('/api/analytics/time');
    return res.data;
};

export const getOverdueStats = async () => {
    const res = await axios.get('/api/analytics/overdue');
    return res.data;
};
