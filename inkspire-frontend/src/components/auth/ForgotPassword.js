import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { validatePassword, validateEmail } from '../../utils/validations';
import '../../styles/Auth.css';

const ForgotPassword = () => {
    const [formData, setFormData] = useState({
        email: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};

        // Validate email
        const emailValidation = validateEmail(formData.email);
        if (!emailValidation.isValid) {
            newErrors.email = emailValidation.error;
        }

        // Validate password
        const passwordValidation = validatePassword(formData.newPassword);
        if (!passwordValidation.isValid) {
            newErrors.newPassword = passwordValidation.errors;
        }

        // Validate password confirmation
        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords don't match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const success = await resetPassword(formData.email, formData.newPassword);
            if (success) {
                alert('Password reset successful! Please login with your new password.');
                navigate('/login');
            } else {
                setErrors({ submit: 'User not found. Please check your email.' });
            }
        } catch (err) {
            setErrors({ submit: 'Failed to reset password. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Reset Password</h2>
                
                {errors.submit && <div className="error-message">{errors.submit}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input 
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className={errors.email ? 'error' : ''}
                            required 
                        />
                        {errors.email && <div className="error-text">{errors.email}</div>}
                    </div>

                    <div className="form-group">
                        <label>New Password</label>
                        <input 
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="Enter new password"
                            className={errors.newPassword ? 'error' : ''}
                            required 
                        />
                        {errors.newPassword && Array.isArray(errors.newPassword) && (
                            <div className="error-list">
                                {errors.newPassword.map((error, index) => (
                                    <div key={index} className="error-text">{error}</div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <input 
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm new password"
                            className={errors.confirmPassword ? 'error' : ''}
                            required 
                        />
                        {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
                    </div>
                    
                    <button disabled={loading} type="submit" className="auth-btn">
                        {loading ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                </form>
                
                <div className="auth-links">
                    <Link to="/login">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;