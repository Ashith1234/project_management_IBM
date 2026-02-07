import axios from 'axios';

export const getProjectTasks = async (projectId) => {
    const res = await axios.get(`/api/tasks?project=${projectId}`);
    return res.data;
};
