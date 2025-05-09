import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../Services/authService';
import '../css/Login.css';
import Navbar from '../components/NavBar';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaFacebook } from "react-icons/fa";
import { motion } from "framer-motion";

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear any existing errors
        try {
            setIsSubmitting(true);
            const response = await authService.login(formData.email, formData.password);
            // Store the token
            localStorage.setItem('token', response.token);
            navigate('/Profile');
        } catch (error) {
            if (typeof error === 'string') {
                setError(error);
            } else if (error.message) {
                setError(error.message);
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    const handleFacebookLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/facebook';
    };

    return (
        <div className="Login-login-page">
            <Navbar/>
            <motion.div 
                className="Login-login-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="Login-glass-card">
                    <motion.h2 
                        className="Login-login-title"
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        Welcome Back
                    </motion.h2>
                    
                    {error && (
                        <motion.div 
                            className="Login-error-banner"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {error}
                        </motion.div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="Login-form-group">
                            <label>Email</label>
                            <div className="Login-input-wrapper">
                                <div className="Login-input-with-icon">
                                    <div className="Login-input-icon"><FaEnvelope /></div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="your.email@example.com"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="Login-form-group">
                            <label>Password</label>
                            <div className="Login-input-wrapper">
                                <div className="Login-input-with-icon">
                                    <div className="Login-input-icon"><FaLock /></div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <div 
                                        className="Login-password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <motion.button 
                            type="submit" 
                            className="Login-login-btn" 
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            {isSubmitting ? (
                                <div className="Login-spinner-container">
                                    <div className="Login-spinner"></div>
                                    <span>Logging in...</span>
                                </div>
                            ) : 'Login'}
                        </motion.button>
                    </form>

                    <div className="Login-divider">
                        <span>or continue with</span>
                    </div>

                    <div className="Login-social-login-buttons">
                        <motion.button 
                            onClick={handleGoogleLogin} 
                            className="Login-social-btn Login-google-btn"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <FaGoogle className="Login-social-icon" />
                            <span>Google</span>
                        </motion.button>
                        <motion.button 
                            onClick={handleFacebookLogin} 
                            className="Login-social-btn Login-facebook-btn"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <FaFacebook className="Login-social-icon" />
                            <span>Facebook</span>
                        </motion.button>
                    </div>

                    <p className="Login-register-text">
                        Don't have an account?{' '}
                        <motion.span 
                            onClick={() => navigate('/Register')} 
                            className="Login-link"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                        >
                            Register here
                        </motion.span>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
