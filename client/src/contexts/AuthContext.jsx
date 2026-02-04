import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // Configure axios defaults
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }

    // Check if user is logged in
    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get('/api/auth/me');
                setUser(res.data.data);
            } catch (err) {
                console.error(err);
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
                toast.error('Session expired, please login again');
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await axios.post('/api/auth/login', { email, password });

            const { token, user } = res.data;

            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);

            toast.success('Logged in successfully');
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed';
            toast.error(msg);
            return { success: false, error: msg };
        }
    };

    const register = async (userData) => {
        try {
            const res = await axios.post('/api/auth/register', userData);

            const { token, user } = res.data;

            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);

            toast.success('Registration successful');
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed';
            toast.error(msg);
            return { success: false, error: msg };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        toast.success('Logged out successfully');
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
