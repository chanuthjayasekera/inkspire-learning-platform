import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Typography,
  Box 
} from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import ShareIcon from '@mui/icons-material/Share';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import GroupIcon from '@mui/icons-material/Group';
import '../styles/LearningPlans.css';

const API_URL = 'http://localhost:8081';

const LearningPlans = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { token } = useAuth();
  const [notificationsShown, setNotificationsShown] = useState(false);

  useEffect(() => {
    const fetchPendingReminders = async () => {
      // Only fetch if notifications haven't been shown yet
      if (token && !notificationsShown) {
        try {
          console.log('Fetching pending reminders...');
          const response = await fetch(`${API_URL}/api/learning-plans/reminders`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Failed to fetch pending reminders');
          }

          const reminders = await response.json();
          
          // Filter out invalid reminders and show notifications
          reminders.forEach((reminder) => {
            if (!reminder.completed && reminder.planTitle) {
              showSuccess(`Plan "${reminder.planTitle}" is pending! Due on ${new Date(reminder.dueDate).toLocaleString()}`, {
                autoHideDuration: 10000, // 10 seconds
                onClose: async () => {
                  try {
                    // Mark reminder as completed when notification is closed
                    await fetch(`${API_URL}/api/learning-plans/reminders/${reminder.id}`, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                      credentials: 'include',
                    });
                  } catch (error) {
                    console.error('Error closing reminder:', error);
                  }
                }
              });
            }
          });
          
          setNotificationsShown(true);
        } catch (error) {
          console.error('Error fetching pending reminders:', error);
          showError('Failed to fetch reminders: ' + error.message);
        }
      }
    };

    fetchPendingReminders();
  }, [token, showSuccess, showError, notificationsShown]);

  const options = [
    {
      title: "Your Learning Progress",
      description: "Track your learning journey with personalized plans, milestones, and progress tracking tools.",
      icon: <TimelineIcon className="card-icon progress-icon" />,
      action: () => navigate('/plans'),
      buttonText: "View My Plans",
      className: "progress-card"
    },
    {
      title: "Skill Sharing",
      description: "Share your knowledge with the community. Create and publish learning plans for others to follow.",
      icon: <ShareIcon className="card-icon share-icon" />,
      action: () => navigate('/create-plan'),
      buttonText: "Create Plan",
      className: "share-card"
    },
    {
      title: "Personal Reminders",
      description: "Stay on track with personalized reminders. Never miss a learning milestone again.",
      icon: <NotificationsActiveIcon className="card-icon reminder-icon" />,
      action: () => navigate('/reminders'),
      buttonText: "Manage Reminders",
      className: "reminder-card"
    },
    {
      title: "Followed Plans",
      description: "Explore learning plans from users you follow and stay inspired by their progress.",
      icon: <GroupIcon className="card-icon followed-icon" />,
      action: () => navigate('/followed-plans'),
      buttonText: "View Followed Plans",
      className: "followed-card"
    }
  ];

  return (
    <div className="learning-plans-root">
      <div className="hero-banner">
        <Typography variant="h2" className="page-title">
          Learning Plans
        </Typography>
        <Typography variant="h5" className="page-subtitle">
          Choose your path to success
        </Typography>
      </div>

      <Container maxWidth="lg" className="cards-container">
        <Grid container spacing={4} justifyContent="center" alignItems="stretch">
          {options.map((option, index) => (
            <Grid item xs={12} md={3} key={index}>
              <Card className={`plan-card ${option.className}`}>
                <CardContent className="card-content">
                  <div>
                    <Box className="icon-wrapper">
                      {option.icon}
                    </Box>
                    <Typography variant="h5" className="card-title">
                      {option.title}
                    </Typography>
                    <Typography className="card-description">
                      {option.description}
                    </Typography>
                  </div>
                  <Button 
                    variant="contained" 
                    onClick={option.action}
                    className="action-button"
                  >
                    {option.buttonText}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
};

export default LearningPlans;