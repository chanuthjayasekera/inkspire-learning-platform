import React, { useState, useEffect } from 'react';
import { TextField, Button, Checkbox, FormControlLabel, Typography, Alert } from '@mui/material';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/CreatePlan.css';

const API_URL = 'http://localhost:8081';

function CreatePlan() {
  const navigate = useNavigate();
  const { currentUser, token } = useAuth();
  const [formData, setFormData] = useState({
    userId: currentUser?.id,
    title: '',
    description: '',
    isPublic: false,
    milestones: []
  });
  const [milestoneInput, setMilestoneInput] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    if (!token || !currentUser) {
      showError('Please log in to create a plan');
      navigate('/login');
    }
  }, [token, currentUser, navigate]);

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    else if (formData.title.length > 100) errors.title = 'Title must be less than 100 characters';

    if (!formData.description.trim()) errors.description = 'Description is required';
    else if (formData.description.length > 500) errors.description = 'Description must be less than 500 characters';

    if (formData.milestones.length === 0) errors.milestones = 'At least one milestone is required';
    else if (formData.milestones.length > 10) errors.milestones = 'Maximum 10 milestones allowed';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const addMilestone = () => {
    if (!milestoneInput.trim()) {
      setFormErrors({ ...formErrors, milestoneInput: 'Milestone cannot be empty' });
      return;
    }
    if (milestoneInput.length > 200) {
      setFormErrors({ ...formErrors, milestoneInput: 'Milestone must be less than 200 characters' });
      return;
    }
    if (formData.milestones.length >= 10) {
      setFormErrors({ ...formErrors, milestones: 'Maximum 10 milestones allowed' });
      return;
    }

    const description = milestoneInput.trim();
    const title = description.substring(0, Math.min(50, description.length));

    setFormData({
      ...formData,
      milestones: [...formData.milestones, { 
        description: description,
        title: title,
        completed: false,
        notes: ""
      }]
    });
    setMilestoneInput('');
    setFormErrors({ ...formErrors, milestoneInput: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        isPublic: formData.isPublic,
        milestones: formData.milestones.map(m => ({
          title: m.description.substring(0, 50),
          description: m.description,
          completed: false,
          notes: ""
        }))
      };

      console.log('Creating plan with payload:', payload);

      const response = await fetch(`${API_URL}/api/learning-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Create plan response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create plan');
      }

      showSuccess('Plan created successfully!');
      
      // Fetch updated plans list and notify PlanList
      const plansResponse = await fetch(`${API_URL}/api/learning-plans`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      if (!plansResponse.ok) {
        throw new Error('Failed to fetch plans after creation');
      }
      const plansData = await plansResponse.json();
      console.log('Post-creation fetched plans:', plansData);
      window.dispatchEvent(new CustomEvent('plansUpdated', { detail: plansData }));

      navigate('/plans');
    } catch (error) {
      console.error('Error creating plan:', error);
      showError(error.message);
    }
  };

  return (
    <div className="create-plan-container">
      <div className="create-plan-form">
        <Typography variant="h4" className="create-plan-title">Create Learning Plan</Typography>
        <form onSubmit={handleSubmit} noValidate>
          <TextField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            fullWidth
            margin="normal"
            className="input-field"
            error={!!formErrors.title}
            helperText={formErrors.title}
          />
          <TextField
            label="Description (max 500 characters)"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            multiline
            rows={4}
            fullWidth
            margin="normal"
            className="input-field"
            error={!!formErrors.description}
            helperText={formErrors.description || `${formData.description.length}/500`}
            inputProps={{ maxLength: 500 }}
          />
          <div className="milestone-section">
            <TextField
              label="Add Milestone"
              value={milestoneInput}
              onChange={(e) => setMilestoneInput(e.target.value)}
              className="input-field"
              error={!!formErrors.milestoneInput}
              helperText={formErrors.milestoneInput || 'At least one milestone is required'}
            />
            <Button variant="contained" color="secondary" onClick={addMilestone} className="action-button">Add</Button>
            {formErrors.milestones && <Alert severity="error">{formErrors.milestones}</Alert>}
            <ul className="milestone-list">
              {formData.milestones.map((m, index) => (
                <li key={index}>{m.description}</li>
              ))}
            </ul>
          </div>
          <FormControlLabel
            control={
              <Checkbox
                name="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  isPublic: e.target.checked
                }))}
                color="primary"
              />
            }
            label="Public"
          />
          <Button type="submit" variant="contained" color="primary" fullWidth className="submit-button">Create Plan</Button>
        </form>
      </div>
    </div>
  );
}

export default CreatePlan;