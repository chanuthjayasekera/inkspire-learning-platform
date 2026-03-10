import React, { useState, useEffect } from 'react';
import { Button, Checkbox, TextField, Typography, Modal, Box, IconButton, FormControlLabel, Alert, List, ListItem, ListItemText } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import '../App.css'; 
import GetAppIcon from '@mui/icons-material/GetApp';
import TimelineIcon from '@mui/icons-material/Timeline';
import '../styles/Plans.css';

const API_URL = 'http://localhost:8081';

function PlanList() {
  const [plans, setPlans] = useState([]);
  const [materialFile, setMaterialFile] = useState(null);
  const [editPlan, setEditPlan] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [editMilestoneInput, setEditMilestoneInput] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const { showError, showSuccess } = useNotification();
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchPlans();
    }

    // Listen for plans update event from CreatePlan
    const handlePlansUpdated = (event) => {
      console.log('Received plansUpdated event:', event.detail);
      setPlans(event.detail);
    };
    window.addEventListener('plansUpdated', handlePlansUpdated);

    // Cleanup listener on unmount
    return () => window.removeEventListener('plansUpdated', handlePlansUpdated);
  }, [token]);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${API_URL}/api/learning-plans`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch plans: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Fetched plans:', data);
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      showError(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/learning-plans/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete plan: ${response.statusText}`);
      }
      
      await fetchPlans();
      showSuccess('Plan deleted successfully!');
    } catch (error) {
      showError(error.message);
    }
  };

  const handleMaterialUpload = async (planId) => {
    if (!materialFile) {
      showError('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', materialFile);

    try {
      const response = await fetch(`${API_URL}/api/learning-plans/${planId}/materials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to upload material: ${response.statusText}`);
      }

      await fetchPlans();
      setMaterialFile(null);
      showSuccess('Material uploaded successfully!');
    } catch (error) {
      console.error('Error uploading material:', error);
      showError(error.message);
    }
  };

  const handleEdit = (plan) => {
    console.log('Editing plan:', plan);
    setEditPlan(plan);
    setEditFormData({
      id: plan.id,
      title: plan.title || '',
      description: plan.description || '',
      isPublic: Boolean(plan.isPublic),
      milestones: (plan.milestones || []).map(m => ({
        id: m.id,
        title: m.title || '',
        description: m.description || '',
        completed: Boolean(m.completed),
        notes: m.notes || ''
      })),
      learningMaterials: plan.learningMaterials || []
    });
    setFormErrors({});
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleMilestoneStatus = (index) => {
    const updatedMilestones = [...editFormData.milestones];
    updatedMilestones[index].completed = !updatedMilestones[index].completed;
    setEditFormData({ ...editFormData, milestones: updatedMilestones });
  };

  const addEditMilestone = () => {
    if (!editMilestoneInput.trim()) {
      setFormErrors({ ...formErrors, milestoneInput: 'Milestone cannot be empty' });
      return;
    }
    if (editMilestoneInput.length > 200) {
      setFormErrors({ ...formErrors, milestoneInput: 'Milestone must be less than 200 characters' });
      return;
    }
    if (editFormData.milestones.length >= 10) {
      setFormErrors({ ...formErrors, milestones: 'Maximum 10 milestones allowed' });
      return;
    }
    setEditFormData({
      ...editFormData,
      milestones: [...editFormData.milestones, { description: editMilestoneInput, completed: false }]
    });
    setEditMilestoneInput('');
    setFormErrors({ ...formErrors, milestoneInput: '' });
  };

  const removeMaterial = (index) => {
    const updatedMaterials = [...editFormData.learningMaterials];
    updatedMaterials.splice(index, 1);
    setEditFormData({ ...editFormData, learningMaterials: updatedMaterials });
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editFormData.title.trim()) errors.title = 'Title is required';
    else if (editFormData.title.length > 100) errors.title = 'Title must be less than 100 characters';

    if (!editFormData.description.trim()) errors.description = 'Description is required';
    else if (editFormData.description.length > 500) errors.description = 'Description must be less than 500 characters';

    if (editFormData.milestones.length === 0) errors.milestones = 'At least one milestone is required';
    else if (editFormData.milestones.length > 10) errors.milestones = 'Maximum 10 milestones allowed';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;

    try {
      const payload = {
        id: editFormData.id,
        title: editFormData.title,
        description: editFormData.description,
        isPublic: editFormData.isPublic,
        milestones: editFormData.milestones.map(m => ({
          id: m.id,
          title: m.title || m.description.substring(0, 50),
          description: m.description,
          completed: m.completed,
          notes: m.notes || ''
        }))
      };

      console.log('Updating plan with payload:', payload);

      const response = await fetch(`${API_URL}/api/learning-plans/${editFormData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update plan');
      }

      const updatedPlan = await response.json();
      console.log('Update response:', updatedPlan);

      await fetchPlans(); // Refresh the plans list to reflect the updated isPublic
      setEditPlan(null);
      setEditFormData(null);
      showSuccess('Plan updated successfully!');
    } catch (error) {
      console.error('Error updating plan:', error);
      showError(error.message);
    }
  };

  const closeModal = () => {
    setEditPlan(null);
    setEditFormData(null);
    setEditMilestoneInput('');
    setFormErrors({});
  };

  const handleAddMilestone = () => {
    if (!editMilestoneInput.trim()) {
      showError('Please enter a milestone description');
      return;
    }

    setEditFormData(prev => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        {
          title: editMilestoneInput.substring(0, 50),
          description: editMilestoneInput,
          completed: false,
          notes: ''
        }
      ]
    }));
    setEditMilestoneInput('');
  };

  const handleRemoveMilestone = (index) => {
    setEditFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const handleDeleteMaterial = async (planId, materialIndex) => {
    try {
      const response = await fetch(`${API_URL}/api/learning-plans/${planId}/materials/${materialIndex}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete material error:', errorText);
        throw new Error(errorText || 'Failed to delete material');
      }

      // Update local state immediately
      setPlans(prevPlans => {
        return prevPlans.map(p => {
          if (p.id === planId) {
            const updatedMaterials = [...p.learningMaterials];
            updatedMaterials.splice(materialIndex, 1);
            return {
              ...p,
              learningMaterials: updatedMaterials
            };
          }
          return p;
        });
      });

      showSuccess('Material deleted successfully');
    } catch (error) {
      console.error('Error in handleDeleteMaterial:', error);
      showError(error.message || 'Failed to delete material. Please try again.');
    }
  };

  const handleMilestoneStatusChange = async (planId, milestoneId, completed) => {
    try {
      const response = await fetch(`${API_URL}/api/learning-plans/${planId}/milestones/${milestoneId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ completed })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update milestone status');
      }

      await fetchPlans();
      showSuccess('Milestone status updated');
    } catch (error) {
      showError(error.message);
    }
  };

  const getDisplayFileName = (fileName) => {
    // Remove the timestamp prefix and underscores
    const displayName = fileName.split('_').slice(1).join('_');
    return displayName;
  };

  const handleDownload = async (planId, materialIndex) => {
    try {
      const response = await fetch(`${API_URL}/api/learning-plans/${planId}/materials/${materialIndex}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to download material');
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const fileName = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `material_${materialIndex + 1}`;

      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      
      // Append to document, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
      
      showSuccess('Download started successfully');
    } catch (error) {
      showError(error.message);
    }
  };

  const cleanupInvalidReminders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/learning-plans/reminders/cleanup`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

  

      // After cleanup, fetch reminders again
      await fetchPlans();
    } catch (error) {
      console.error('Error cleaning up reminders:', error);
      showError(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      // Clean up invalid reminders when component mounts
      cleanupInvalidReminders();
      fetchPlans();
    }

    const handlePlansUpdated = (event) => {
      console.log('Received plansUpdated event:', event.detail);
      setPlans(event.detail);
    };
    window.addEventListener('plansUpdated', handlePlansUpdated);

    return () => window.removeEventListener('plansUpdated', handlePlansUpdated);
  }, [token]);

  return (
    <div className="plans-container">
      <div className="plans-grid">
        {plans.map(plan => (
          <div key={plan.id} className="plan-card">
            <div className="plan-header">
              <Typography variant="h6" className="plan-title">
                {plan.title}
              </Typography>
              <div className={`plan-visibility ${plan.isPublic ? 'public' : 'private'}`}>
                {plan.isPublic ? 'Public' : 'Private'}
              </div>
            </div>
            
            <Typography className="plan-description">
              {plan.description}
            </Typography>

            <div className="milestones-section">
              <Typography className="milestones-title">
                <TimelineIcon /> Milestones
              </Typography>
              {plan.milestones && plan.milestones.map(milestone => (
                <div key={milestone.id} className="milestone-item">
                  <div className="milestone-header">
                    <span className={`milestone-status ${milestone.completed ? '' : 'pending'}`}>
                      {milestone.completed ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                  <Typography className="milestone-content">
                    {milestone.description}
                  </Typography>
                </div>
              ))}
            </div>

            {plan.learningMaterials && plan.learningMaterials.length > 0 && (
              <div className="materials-section">
                <Typography className="materials-title">
                  Learning Materials
                </Typography>
                <List>
                  {plan.learningMaterials.map((material, index) => (
                    <ListItem key={index} className="material-item">
                      <Button
                        onClick={() => handleDownload(plan.id, index)}
                        variant="text"
                        color="primary"
                        startIcon={<GetAppIcon />}
                        className="material-button"
                      >
                        {getDisplayFileName(material)}
                      </Button>
                      <IconButton
                        onClick={() => {
                          // Add confirmation before deletion
                          if (window.confirm('Are you sure you want to delete this material?')) {
                            handleDeleteMaterial(plan.id, index);
                          }
                        }}
                        size="small"
                        color="error"
                        className="delete-material-button"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </div>
            )}

            <div className="plan-actions">
              <IconButton onClick={() => handleEdit(plan)} color="primary">
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDelete(plan.id)} color="error">
                <DeleteIcon />
              </IconButton>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!editPlan} onClose={closeModal}>
        <Box className="modal-content">
          <Typography variant="h6" className="title">Edit Learning Plan</Typography>
          {editFormData && (
            <form onSubmit={handleEditSubmit} noValidate>
              <TextField
                label="Title"
                name="title"
                value={editFormData.title}
                onChange={handleEditInputChange}
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
                value={editFormData.description}
                onChange={handleEditInputChange}
                required
                multiline
                rows={4}
                fullWidth
                margin="normal"
                className="input-field"
                error={!!formErrors.description}
                helperText={formErrors.description || `${editFormData.description.length}/500`}
                inputProps={{ maxLength: 500 }}
              />
              <div className="milestone-section">
                <Typography variant="subtitle1">Milestones</Typography>
                <div className="add-milestone">
                  <TextField
                    label="New Milestone"
                    value={editMilestoneInput}
                    onChange={(e) => setEditMilestoneInput(e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddMilestone}
                    disabled={!editMilestoneInput.trim()}
                  >
                    Add Milestone
                  </Button>
                </div>
                <List>
                  {editFormData.milestones.map((milestone, index) => (
                    <ListItem key={index}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Boolean(milestone.completed)}
                            onChange={(e) => {
                              const updatedMilestones = [...editFormData.milestones];
                              updatedMilestones[index] = {
                                ...milestone,
                                completed: e.target.checked
                              };
                              setEditFormData(prev => ({
                                ...prev,
                                milestones: updatedMilestones
                              }));
                            }}
                            color="primary"
                          />
                        }
                        label={
                          <div>
                            <Typography variant="body1">{milestone.title}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {milestone.description}
                            </Typography>
                          </div>
                        }
                      />
                      <IconButton
                        onClick={() => handleRemoveMilestone(index)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </div>
              <div className="materials-section">
                <Typography variant="subtitle1">Learning Materials:</Typography>
                <List>
                  {editFormData.learningMaterials && editFormData.learningMaterials.map((material, index) => (
                    <ListItem key={index} style={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        onClick={() => handleDownload(editFormData.id, index)}
                        variant="text"
                        color="primary"
                        style={{ textTransform: 'none', marginRight: '10px' }}
                      >
                        {getDisplayFileName(material)}
                      </Button>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteMaterial(editFormData.id, index)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
                <div className="upload-section" style={{ marginTop: '10px' }}>
                  <input
                    type="file"
                    onChange={(e) => setMaterialFile(e.target.files[0])}
                    style={{ marginBottom: '10px' }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleMaterialUpload(editFormData.id)}
                    disabled={!materialFile}
                    style={{ marginLeft: '10px' }}
                  >
                    Upload Material
                  </Button>
                </div>
              </div>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isPublic"
                    checked={editFormData.isPublic}
                    onChange={(e) => {
                      setEditFormData(prev => ({
                        ...prev,
                        isPublic: e.target.checked
                      }));
                    }}
                    color="primary"
                  />
                }
                label="Public"
              />
              <Button type="submit" variant="contained" color="primary" fullWidth className="submit-button">Save Changes</Button>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={closeModal} 
                fullWidth 
                className="cancel-button"
                sx={{ 
                  color: '#d32f2f',
                  borderColor: '#d32f2f',
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(211, 47, 47, 0.04)',
                    borderColor: '#d32f2f'
                  }
                }}
              >
                Cancel
              </Button>
            </form>
          )}
        </Box>
      </Modal>
    </div>
  );
}

export default PlanList;