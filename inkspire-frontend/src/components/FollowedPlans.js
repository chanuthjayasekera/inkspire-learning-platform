import React, { useState, useEffect } from 'react';
import { getFollowedUsersPlans } from './api';
import { toast } from 'react-toastify';
import { useFollow } from '../context/FollowContext';
import { useAuth } from '../context/AuthContext';
import { Avatar, Box, Button, Typography, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SchoolIcon from '@mui/icons-material/School';
import '../styles/FollowedPlans.css';

const API_URL = 'http://localhost:8081';

const FollowedPlans = () => {
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { followTrigger } = useFollow();
  const { token, logout, refreshToken } = useAuth();

  useEffect(() => {
    fetchFollowedUsersPlans();
  }, [followTrigger]);

  const fetchFollowedUsersPlans = async () => {
    setLoading(true);
    try {
      const response = await getFollowedUsersPlans();
      const planData = response.data.map(plan => ({
        ...plan,
        username: plan.user?.name || 'Unknown User',
        profileImage: plan.user?.profileImage || null,
        type: plan.type || 'General',
      }));
      setPlans(planData);
      setFilteredPlans(planData);
      if (planData.length === 0) {
        toast.info('No public learning plans from followed users.');
      } else {
        console.log('Processed plans:', planData);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error(`Failed to load plans: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    const filtered = plans.filter(plan =>
      plan.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPlans(filtered);
  };

  const handleDownloadMaterial = async (planId, index, fileName) => {
    try {
      if (!token) {
        toast.error('Please log in to download materials.');
        return;
      }

      console.log('Using token for download:', token);

      let currentToken = token;
      let response = await fetch(`${API_URL}/api/learning-plans/${planId}/materials/${index}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Accept': 'application/octet-stream',
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        console.log('Received 401, attempting token refresh');
        try {
          currentToken = await refreshToken();
        } catch (refreshError) {
          toast.error('Session expired. Please log in again.');
          setTimeout(() => logout(), 2000);
          return;
        }
        // Retry with new token
        response = await fetch(`${API_URL}/api/learning-plans/${planId}/materials/${index}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Accept': 'application/octet-stream',
          },
          credentials: 'include',
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to download material (Status: ${response.status})`);
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      let downloadFileName = fileName || `material-${index}`;
      if (contentDisposition && contentDisposition.includes('filename=')) {
        downloadFileName = contentDisposition.split('filename=')[1].replace(/"/g, '');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Material downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`Failed to download material: ${error.message}`);
    }
  };

  return (
    <div className="followed-plans-root">
      <div className="followed-hero-banner">
        <Typography className="followed-page-title">Followed Learning Plans</Typography>
        <Typography className="followed-page-subtitle">Discover vibrant plans from users you follow</Typography>
      </div>
      <Box className="followed-cards-container">
        <Box className="followed-search-container">
          <TextField
            className="followed-search-input"
            variant="outlined"
            placeholder="Search plans by title..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon className="followed-search-icon" />,
            }}
          />
        </Box>
        {loading ? (
          <Typography className="followed-loading-text">Loading plans...</Typography>
        ) : filteredPlans.length === 0 ? (
          <Typography className="followed-empty-state">
            {searchQuery ? 'No plans match your search.' : 'No public learning plans available.'}
          </Typography>
        ) : (
          <div className="followed-dashboard-cards">
            {filteredPlans.map((plan) => (
              <div key={plan.id} className="followed-plan-card followed-progress-card">
                <div className="followed-card-content">
                  <div className="followed-icon-wrapper">
                    <SchoolIcon className="followed-card-icon" />
                  </div>
                  <Typography className="followed-card-title">{plan.title}</Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Avatar
                      src={plan.profileImage ? `${API_URL}/api/users/profile-image/${plan.profileImage}` : undefined}
                      alt={plan.username}
                      sx={{ width: 32, height: 32, mr: 1, border: '2px solid #2dd4bf' }}
                    />
                    <Typography className="followed-card-description"><strong>Author:</strong> {plan.username}</Typography>
                  </Box>
                  <Typography className="followed-card-description"><strong>Type:</strong> {plan.type}</Typography>
                  <Typography className="followed-card-description"><strong>Description:</strong> {plan.description || 'No description'}</Typography>
                  <div className="followed-milestones-section">
                    <Typography className="followed-card-description"><strong>Milestones:</strong></Typography>
                    {plan.milestones && plan.milestones.length > 0 ? (
                      <ul className="followed-milestones-list">
                        {plan.milestones.map((milestone, index) => (
                          <li key={index} className="followed-milestone-item">
                            {milestone.title || milestone} {milestone.completed ? '(Completed)' : '(Pending)'}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Typography className="followed-no-milestones">No milestones</Typography>
                    )}
                  </div>
                  <div className="followed-materials-section">
                    <Typography className="followed-card-description"><strong>Materials:</strong></Typography>
                    {plan.learningMaterials && plan.learningMaterials.length > 0 ? (
                      <ul className="followed-materials-list">
                        {plan.learningMaterials.map((material, index) => (
                          <li key={index} className="followed-material-item">
                            <Button
                              className="followed-action-button"
                              onClick={() => handleDownloadMaterial(plan.id, index, material)}
                            >
                              Download {material}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Typography className="followed-no-materials">No materials</Typography>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Box>
    </div>
  );
};

export default FollowedPlans;