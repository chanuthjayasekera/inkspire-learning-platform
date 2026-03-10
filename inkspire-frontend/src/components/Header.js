import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Box,
  Tooltip,
  useScrollTrigger,
  Slide,
  Typography
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ForumIcon from '@mui/icons-material/Forum';
import TimelineIcon from '@mui/icons-material/Timeline';
import PeopleIcon from '@mui/icons-material/People';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import '../styles/Header.css';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const trigger = useScrollTrigger();

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2); // Limit to 2 characters
  };

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      <AppBar position="sticky" className="header" elevation={0}>
        <Toolbar className="toolbar">
          <Link to="/" className="logo-container">
            <AutoStoriesIcon className="logo-icon" />
            <Typography variant="h6" className="logo-text">
              InkSpire
            </Typography>
          </Link>

          {currentUser ? (
            <Box className="nav-links">
              <Button
                component={Link}
                to="/"
                className={`nav-button ${isActive('/') ? 'active' : ''}`}
                startIcon={<HomeIcon />}
              >
                Home
              </Button>

              <Button
                component={Link}
                to="/learning-plans"
                className={`nav-button ${isActive('/learning-plans') ? 'active' : ''}`}
                startIcon={<MenuBookIcon />}
              >
                Learning Plans
              </Button>

              <Button
                component={Link}
                to="/posts"
                className={`nav-button ${isActive('/posts') ? 'active' : ''}`}
                startIcon={<ForumIcon />}
              >
                Posts
              </Button>

              <Button
                component={Link}
                to="/progress"
                className={`nav-button ${isActive('/progress') ? 'active' : ''}`}
                startIcon={<TimelineIcon />}
              >
                Progress
              </Button>

              <Button
                component={Link}
                to="/interactions"
                className={`nav-button ${isActive('/interactions') ? 'active' : ''}`}
                startIcon={<PeopleIcon />}
              >
                Interactions
              </Button>

              <Box className="user-actions">
                <Tooltip title="Notifications">
                  <IconButton onClick={handleNotificationClick} className="notification-icon">
                    <Badge badgeContent={3} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                <Tooltip title={currentUser?.name || 'Profile'}>
                  <IconButton onClick={handleProfileClick} className="profile-button">
                    <Avatar className="user-avatar">
                      {getInitials(currentUser?.name)}
                    </Avatar>
                  </IconButton>
                </Tooltip>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  className="profile-menu"
                >
                  <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                    <AccountCircleIcon className="menu-icon" />
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon className="menu-icon" />
                    Logout
                  </MenuItem>
                </Menu>

                <Menu
                  anchorEl={notificationAnchor}
                  open={Boolean(notificationAnchor)}
                  onClose={handleNotificationClose}
                  className="notification-menu"
                >
                  <MenuItem>New comment on your post</MenuItem>
                  <MenuItem>Your plan was featured</MenuItem>
                  <MenuItem>New follower</MenuItem>
                </Menu>
              </Box>
            </Box>
          ) : (
            <Box className="auth-buttons">
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                className="login-button"
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/signup"
                variant="contained"
                className="signup-button"
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </Slide>
  );
};

export default Header;