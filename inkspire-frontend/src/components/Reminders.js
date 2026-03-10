import React, { useState, useEffect } from 'react';
import { Typography, IconButton, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import '../styles/Reminders.css';

const API_URL = 'http://localhost:8081';

function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [plans, setPlans] = useState([]);
  const { showError, showSuccess } = useNotification();
  const { token } = useAuth();

  // Fetch both reminders and plans when component mounts
  useEffect(() => {
    if (token) {
      fetchReminders();
      fetchPlans();
    }
  }, [token]);

  // Fetch all plans
  const fetchPlans = async () => {
    try {
      const response = await fetch(`${API_URL}/api/learning-plans`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }

      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      showError(error.message);
    }
  };

  // Fetch reminders
  const fetchReminders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/learning-plans/reminders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reminders: ${response.statusText}`);
      }

      const data = await response.json();
      setReminders(data);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      showError(error.message);
    }
  };

  // Check if all milestones in a plan are completed
  const checkPlanCompletion = (planId) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan || !plan.milestones || plan.milestones.length === 0) return false;
    return plan.milestones.every(milestone => milestone.completed);
  };

  // Update reminder status based on plan completion
  const updateReminderStatus = async (reminderId, completed) => {
    try {
      const response = await fetch(`${API_URL}/api/learning-plans/reminders/${reminderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ completed })
      });

      if (!response.ok) {
        throw new Error('Failed to update reminder status');
      }

      // Refresh reminders after update
      await fetchReminders();
    } catch (error) {
      console.error('Error updating reminder status:', error);
      showError(error.message);
    }
  };

  // Check and update reminder statuses when plans change
  useEffect(() => {
    if (plans.length > 0 && reminders.length > 0) {
      reminders.forEach(reminder => {
        if (reminder.plan) {
          const isCompleted = checkPlanCompletion(reminder.plan);
          if (isCompleted !== reminder.completed) {
            updateReminderStatus(reminder.id, isCompleted);
          }
        }
      });
    }
  }, [plans, reminders]);

  const handleDelete = async (reminderId) => {
    try {
      const response = await fetch(`${API_URL}/api/learning-plans/reminders/${reminderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete reminder');
      }
      
      await fetchReminders();
      showSuccess('Reminder deleted successfully!');
    } catch (error) {
      showError(error.message);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="reminders-container">
      <Typography variant="h4" className="reminders-title">
        My Reminders
      </Typography>
      
      {reminders.length === 0 ? (
        <Paper elevation={1} className="empty-reminder">
          <Typography>No reminders yet.</Typography>
        </Paper>
      ) : (
        <div className="reminders-list">
          {reminders.map(reminder => {
            const isPlanCompleted = reminder.plan ? checkPlanCompletion(reminder.plan) : false;
            
            return (
              <Paper 
                key={reminder.id} 
                className={`reminder-card ${isPlanCompleted ? 'completed' : ''}`}
                elevation={2}
              >
                <div className="reminder-content">
                  <Typography variant="h6" className="reminder-message">
                    {reminder.message}
                  </Typography>
                  
                  <Typography variant="body2" className="reminder-plan-title">
                    Plan: {reminder.planTitle || 'No associated plan'}
                  </Typography>
                  
                  <Typography variant="body2" className="reminder-due-date">
                    Due: {formatDate(reminder.dueDate)}
                  </Typography>
                  
                  <div className={`reminder-status ${isPlanCompleted ? 'completed' : 'pending'}`}>
                    {isPlanCompleted ? (
                      <>
                        <CheckCircleIcon fontSize="small" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <PendingIcon fontSize="small" />
                        <span>Pending</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="reminder-actions">
                  <IconButton
                    onClick={() => handleDelete(reminder.id)}
                    size="small"
                    className="delete-button"
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              </Paper>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Reminders;