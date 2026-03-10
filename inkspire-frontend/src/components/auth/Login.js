import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [oauthError, setOauthError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Check for OAuth error from URL
    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const oauthErrorParam = urlParams.get('error');
        if (oauthErrorParam) {
            setOauthError('OAuth login failed. Please try again.');
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            const response = await login(formData.email, formData.password);
            if (response && response.token) {
                navigate('/');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Failed to login: ' + (
                typeof err === 'string' ? err :
                err?.response?.data ||
                err?.message ||
                'Invalid email or password'
            ));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Login</h2>

                {error && <div className="error-message">{error}</div>}
                {oauthError && <div className="error-message">{oauthError}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button disabled={loading} type="submit" className="auth-btn">
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                {/* Divider */}
                <div className="divider">
                    <span>or continue with</span>
                </div>

                {/* OAuth Providers */}
                <div className="oauth-providers">
                    <button className="google-button" onClick={loginWithGoogle}>
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png"
                            alt="Google"
                            className="oauth-icon"
                        />
                        Continue with Google
                    </button>

                    <button className="facebook-button">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
                            alt="Facebook"
                            className="oauth-icon"
                        />
                        Continue with Facebook
                    </button>
                </div>

                {/* Links */}
                <div className="auth-links">
                    <Link to="/forgot-password">Forgot Password?</Link>
                    <br />
                    <span>Don't have an account? <Link to="/signup">Sign Up</Link></span>
                </div>
            </div>
        </div>
    );
};

export default Login;
