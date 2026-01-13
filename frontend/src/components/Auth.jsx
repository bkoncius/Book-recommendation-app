import { useState } from 'react';
import axios from 'axios';

const Auth = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const { username, email, password } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const endpoint = isLogin ? '/api/login' : '/api/register';
        const url = `http://localhost:5000${endpoint}`;

        try {
            const response = await axios.post(url, formData);

            if (isLogin) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                onAuthSuccess(response.data.user);
            } else {
                setMessage('Registration successful! You can now login.');
                setIsLogin(true);
                setFormData({ ...formData, password: '' });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <div className="glass-card">
            <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
            <p className="subtitle">
                {isLogin
                    ? 'Enter your credentials to access your library'
                    : 'Join our community of book lovers today'}
            </p>

            {error && <div className="error-msg">{error}</div>}
            {message && <div className="success-msg">{message}</div>}

            <form onSubmit={onSubmit}>
                {!isLogin && (
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={username}
                            onChange={onChange}
                            placeholder="Your name"
                        />
                    </div>
                )}

                <div className="input-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        placeholder="name@example.com"
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary">
                    {isLogin ? 'Login' : 'Sign Up'}
                </button>
            </form>

            <div className="auth-switch">
                {isLogin ? (
                    <>Don't have an account? <span onClick={() => setIsLogin(false)}>Sign Up</span></>
                ) : (
                    <>Already have an account? <span onClick={() => setIsLogin(true)}>Login</span></>
                )}
            </div>
        </div>
    );
};

export default Auth;
