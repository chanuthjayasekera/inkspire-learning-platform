import React, { useState, useEffect } from 'react';
import { getAllUsers, followUser, unfollowUser } from './api';
import { toast } from 'react-toastify';
import { useFollow } from '../context/FollowContext';
import { Avatar, Box, Button, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import '../styles/Dashboard.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { triggerFollowUpdate } = useFollow();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      const userData = response.data.map(user => ({
        id: user.id,
        username: user.name,
        profileImage: user.profileImage,
        isFollowed: user.isFollowing || false,
      }));
      setUsers(userData);
      if (userData.length === 0) {
        toast.info('No users found in the system.');
      } else {
        console.log('Processed users:', userData);
      }
    } catch (error) {
      toast.error(`Failed to load users: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await followUser(userId);
      setUsers(users.map(user =>
        user.id === userId ? { ...user, isFollowed: true } : user
      ));
      triggerFollowUpdate();
      toast.success('User followed successfully!');
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      toast.error(`Failed to follow user: ${errorMsg}`);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await unfollowUser(userId);
      setUsers(users.map(user =>
        user.id === userId ? { ...user, isFollowed: false } : user
      ));
      triggerFollowUpdate();
      toast.success('User unfollowed successfully!');
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      toast.error(`Failed to unfollow user: ${errorMsg}`);
    }
  };

  return (
    <div className="user-list">
      {loading ? (
        <p className="loading-text">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="empty-state">No users available in the system.</p>
      ) : (
        <List>
          {users.map(user => (
            <ListItem key={user.id} className="user-item">
              <ListItemAvatar>
                <Avatar
                  src={user.profileImage ? `http://localhost:8081/api/users/profile-image/${user.profileImage}` : undefined}
                  alt={user.username}
                />
              </ListItemAvatar>
              <ListItemText primary={user.username} />
              <Box ml={2}>
                {user.isFollowed ? (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleUnfollow(user.id)}
                  >
                    Unfollow
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleFollow(user.id)}
                  >
                    Follow
                  </Button>
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
};

export default UserList;