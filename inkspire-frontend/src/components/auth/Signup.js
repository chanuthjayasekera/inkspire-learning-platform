import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { validatePassword, validatePhoneNumber, validateEmail, validateName } from '../../utils/validations';
import '../../styles/Auth.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};
        
        // Validate name
        const nameValidation = validateName(formData.name);
        if (!nameValidation.isValid) {
            newErrors.name = nameValidation.error;
        }

        // Validate email
        const emailValidation = validateEmail(formData.email);
        if (!emailValidation.isValid) {
            newErrors.email = emailValidation.error;
        }

        // Validate phone
        const phoneValidation = validatePhoneNumber(formData.phoneNumber);
        if (!phoneValidation.isValid) {
            newErrors.phoneNumber = phoneValidation.error;
        }

        // Validate password
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
            newErrors.password = passwordValidation.errors;
        }

        // Validate password confirmation
        if (formData.password !== formData.confirmPassword) {
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
            console.log('Submitting signup form with data:', formData); // Debug log
            
            const response = await signup({
                name: formData.name,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                password: formData.password
            });
            
            console.log('Signup response:', response); // Debug log
            
            // Show success message
            alert('Successfully signed up! Please login.');
            navigate('/login');
            
        } catch (err) {
            console.error('Signup error:', err); // Debug log
            setErrors({ 
                submit: err.message || 'Failed to create account. Please try again.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Sign Up</h2>
                
                {errors.submit && <div className="error-message">{errors.submit}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input 
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            className={errors.name ? 'error' : ''}
                            required 
                        />
                        {errors.name && <div className="error-text">{errors.name}</div>}
                    </div>
                    
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
                        <label>Phone Number</label>
                        <input 
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="Enter 10-digit phone number"
                            className={errors.phoneNumber ? 'error' : ''}
                            required 
                        />
                        {errors.phoneNumber && <div className="error-text">{errors.phoneNumber}</div>}
                    </div>
                    
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a strong password"
                            className={errors.password ? 'error' : ''}
                            required 
                        />
                        {errors.password && Array.isArray(errors.password) && (
                            <div className="error-list">
                                {errors.password.map((error, index) => (
                                    <div key={index} className="error-text">{error}</div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input 
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            className={errors.confirmPassword ? 'error' : ''}
                            required 
                        />
                        {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
                    </div>
                    
                    <button disabled={loading} type="submit" className="auth-btn">
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>
                
                <div className="auth-links">
                    <span>Already have an account? <Link to="/login">Login</Link></span>
                </div>
            </div>
        </div>
    );
};

export default Signup;