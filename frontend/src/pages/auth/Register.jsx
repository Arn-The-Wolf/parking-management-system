import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, Car } from 'lucide-react';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'parking_attendant',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'admin' ? '/dashboard' : '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const errMap = {};
        apiErrors.forEach((e) => { errMap[e.field] = e.message; });
        setErrors(errMap);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo"><Car size={32} /></div>
          <h1>XWZ Parking</h1>
          <p>Management System</p>
        </div>
        <div className="auth-features">
          <div className="feature-item">
            <span className="feature-dot" />
            <span>Real-time parking availability</span>
          </div>
          <div className="feature-item">
            <span className="feature-dot" />
            <span>Automated billing & ticketing</span>
          </div>
          <div className="feature-item">
            <span className="feature-dot" />
            <span>Comprehensive reports</span>
          </div>
          <div className="feature-item">
            <span className="feature-dot" />
            <span>Microservices architecture</span>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Create Account</h2>
            <p>Join XWZ Parking Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <div className="input-wrapper">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className={errors.firstName ? 'error' : ''}
                  />
                </div>
                {errors.firstName && <span className="field-error">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <div className="input-wrapper">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className={errors.lastName ? 'error' : ''}
                  />
                </div>
                {errors.lastName && <span className="field-error">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                  className={errors.email ? 'error' : ''}
                />
              </div>
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className={errors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="parking_attendant">Parking Attendant</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <span className="btn-spinner-dark" /> : null}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
