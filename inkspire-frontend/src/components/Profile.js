import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFollow } from '../context/FollowContext';
import { toast } from 'react-toastify';
import { Paper, TextField, Button, Typography, Avatar, Box, IconButton, Dialog, DialogContent } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import PeopleIcon from '@mui/icons-material/People';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import CloseIcon from '@mui/icons-material/Close';
import '../styles/Profile.css';

const API_URL = 'http://localhost:8081';

const Profile = () => {
  const { currentUser, token, logout } = useAuth();
  const { followTrigger, setFollowTrigger } = useFollow();
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState(null); // 'followers' or 'following'
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      setFormData({
        name: currentUser.name || '',
        phoneNumber: storedUser?.phoneNumber || currentUser.phoneNumber || '',
      });
      setProfileImage(storedUser?.profileImage || currentUser.profileImage || null);
    }
  }, [currentUser]);

  useEffect(() => {
    if (viewMode === 'followers') {
      fetchFollowers();
    } else if (viewMode === 'following') {
      fetchFollowing();
    }
  }, [viewMode, followTrigger, token]);

  const handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    if (name === 'phoneNumber' && value && !/^\+?\d{0,15}$/.test(value)) {
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setProfileImage(file);
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    setIsEditing(true);
  };

  const handleCancel = (e) => {
    e.preventDefault();
    setIsEditing(false);
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setFormData({
      name: currentUser.name || '',
      phoneNumber: storedUser?.phoneNumber || currentUser.phoneNumber || '',
    });
    setProfileImage(storedUser?.profileImage || currentUser.profileImage || null);
    setPreviewImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      console.log('Updating profile with data:', JSON.stringify(formData));
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const updatedData = await response.json();

      if (profileImage instanceof File) {
        const formDataImage = new FormData();
        formDataImage.append('file', profileImage);
        const imageResponse = await fetch(`${API_URL}/api/users/profile-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataImage
        });

        if (!imageResponse.ok) {
          const errorData = await imageResponse.json();
          throw new Error(errorData.error || 'Failed to upload profile image');
        }

        const imageData = await imageResponse.json();
        updatedData.profileImage = imageData.fileName;
      }

      const currentStoredUser = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...currentStoredUser, ...formData, profileImage: updatedData.profileImage };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setIsEditing(false);
      setError('');
      setPreviewImage(null);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    }
  };

  const fetchFollowers = async () => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await fetch(`${API_URL}/api/auth/followers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          setTimeout(() => logout(), 2000);
          throw new Error('Unauthorized: Invalid or expired token');
        } else if (response.status === 404) {
          throw new Error('Followers endpoint not found');
        } else {
          throw new Error(errorData.error || `Failed to fetch followers (Status: ${response.status})`);
        }
      }
      const data = await response.json();
      setFollowers(data.map(user => ({
        id: user.id,
        username: user.name || 'Unknown User',
        profileImage: user.profileImage || null,
      })));
    } catch (error) {
      console.error('Error fetching followers:', error);
      toast.error(`Failed to load followers: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowing = async () => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await fetch(`${API_URL}/api/auth/following`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          setTimeout(() => logout(), 2000);
          throw new Error('Unauthorized: Invalid or expired token');
        } else if (response.status === 404) {
          throw new Error('Following endpoint not found');
        } else {
          throw new Error(errorData.error || `Failed to fetch following (Status: ${response.status})`);
        }
      }
      const data = await response.json();
      setFollowing(data.map(user => ({
        id: user.id,
        username: user.name || 'Unknown User',
        profileImage: user.profileImage || null,
      })));
    } catch (error) {
      console.error('Error fetching following:', error);
      toast.error(`Failed to load following: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (userId, isFollowing) => {
    try {
      const endpoint = isFollowing ? `/api/auth/unfollow/${userId}` : `/api/auth/follow/${userId}`;
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to ${isFollowing ? 'unfollow' : 'follow'} user`);
      }
      setFollowTrigger(prev => !prev);
      toast.success(`${isFollowing ? 'Unfollowed' : 'Followed'} user successfully!`);
    } catch (error) {
      console.error(`Error ${isFollowing ? 'unfollowing' : 'following'} user:`, error);
      toast.error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user: ${error.message}`);
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <Paper elevation={3} className="profile-paper">
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>

        <Box display="flex" justifyContent="center" mb={2}>
          <Avatar
            src={previewImage || (profileImage ? `${API_URL}/api/users/profile-image/${profileImage}` : undefined)}
            alt={currentUser.name}
            sx={{ width: 100, height: 100 }}
            aria-label="User profile image"
          >
            {!previewImage && !profileImage && currentUser.name?.charAt(0).toUpperCase()}
          </Avatar>
          {isEditing && (
            <IconButton component="label" aria-label="Upload profile image">
              <PhotoCamera />
              <input type="file" accept="image/*" hidden onChange={handleImageChange} />
            </IconButton>
          )}
        </Box>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-field">
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              fullWidth
              margin="normal"
              variant="outlined"
              inputProps={{ 'aria-label': 'Name' }}
            />
          </div>

          <div className="profile-field">
            <TextField
              label="Email"
              value={currentUser.email || ''}
              disabled
              fullWidth
              margin="normal"
              variant="outlined"
              helperText="Email cannot be changed"
              inputProps={{ 'aria-label': 'Email (read-only)' }}
            />
          </div>

          <div className="profile-field">
            <TextField
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              disabled={!isEditing}
              fullWidth
              margin="normal"
              variant="outlined"
              inputProps={{ 'aria-label': 'Phone Number' }}
            />
          </div>

          {error && (
            <Typography color="error" className="error-message" role="alert">
              {error}
            </Typography>
          )}

          <div className="profile-actions">
            {isEditing ? (
              <>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  aria-label="Save profile changes"
                >
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleCancel}
                  aria-label="Cancel editing"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="contained"
                color="primary"
                onClick={handleEdit}
                aria-label="Edit profile"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </form>

        <Box className="social-buttons" mt={3}>
          <Button
            variant="contained"
            className="social-button followers-button"
            startIcon={<PeopleIcon />}
            onClick={() => setViewMode(viewMode === 'followers' ? null : 'followers')}
            aria-label={viewMode === 'followers' ? 'Hide followers' : 'Show followers'}
          >
            {viewMode === 'followers' ? 'Hide Followers' : 'Show Followers'}
          </Button>
          <Button
            variant="contained"
            className="social-button following-button"
            startIcon={<GroupAddIcon />}
            onClick={() => setViewMode(viewMode === 'following' ? null : 'following')}
            aria-label={viewMode === 'following' ? 'Hide following' : 'Show following'}
          >
            {viewMode === 'following' ? 'Hide Following' : 'Show Following'}
          </Button>
        </Box>
      </Paper>

      <Dialog
        open={!!viewMode}
        onClose={() => setViewMode(null)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="user-list-dialog-title"
        PaperProps={{
          className: 'user-list-modal'
        }}
      >
        <Box className="user-list-header">
          <Typography id="user-list-dialog-title" variant="h6">
            {viewMode === 'followers' ? 'Followers' : 'Following'}
          </Typography>
          <IconButton
            onClick={() => setViewMode(null)}
            className="close-button"
            aria-label="Close user list"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent className="user-list-content">
          {loading ? (
            <Box className="loading-container">
              <Typography className="loading-text">Loading...</Typography>
            </Box>
          ) : (
            <Box className="user-list">
              {(viewMode === 'followers' ? followers : following).length === 0 ? (
                <Typography className="empty-state">
                  {viewMode === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
                </Typography>
              ) : (
                (viewMode === 'followers' ? followers : following).map(user => (
                  <Box className="user-card" key={user.id} role="article">
                    <Avatar
                      src={user.profileImage ? `${API_URL}/api/users/profile-image/${user.profileImage}` : undefined}
                      alt={user.username}
                      sx={{ width: 60, height: 60, mb: 1, border: '2px solid #2dd4bf' }}
                      aria-label={`${user.username}'s profile image`}
                    >
                      {!user.profileImage && user.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography className="user-card-title">{user.username}</Typography>
                  </Box>
                ))
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;