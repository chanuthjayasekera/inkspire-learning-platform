import React, { useState, useEffect } from 'react';
import { Button, Grid, Paper, Typography, Box, Modal, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import TimelineIcon from '@mui/icons-material/Timeline';
import ForumIcon from '@mui/icons-material/Forum';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import CloseIcon from '@mui/icons-material/Close';
import UserList from './UserList';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openUserModal, setOpenUserModal] = useState(false);

  const heroContent = [
    {
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
      title: 'Welcome to InkSpire',
      subtitle: 'Empowering Your Learning Journey'
    },
    {
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
      title: 'Learn Together',
      subtitle: 'Join our community of passionate learners'
    },
    {
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
      title: 'Track Your Progress',
      subtitle: 'Achieve your goals step by step'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === heroContent.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenUserModal = () => setOpenUserModal(true);
  const handleCloseUserModal = () => setOpenUserModal(false);

  return (
    <div className="dashboard-root">
      {/* Hero Section */}
      <section className="hero-section">
        {heroContent.map((content, index) => (
          <div
            key={index}
            className={`hero-background ${index === currentImageIndex ? 'active' : ''}`}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${content.image})`
            }}
          />
        ))}
        <div className="hero-overlay">
          <Typography 
            variant="h1" 
            className={`hero-title fade-in ${currentImageIndex === heroContent.indexOf(heroContent[currentImageIndex]) ? 'active' : ''}`}
          >
            {heroContent[currentImageIndex].title}
          </Typography>
          <Typography 
            variant="h5" 
            className={`hero-subtitle fade-in ${currentImageIndex === heroContent.indexOf(heroContent[currentImageIndex]) ? 'active' : ''}`}
          >
            {heroContent[currentImageIndex].subtitle}
          </Typography>
          <Button 
            component={Link} 
            to="/learning-plans"
            variant="contained" 
            size="large"
            className="hero-button"
          >
            Start Your Journey
          </Button>
        </div>
        <div className="slide-indicators">
          {heroContent.map((_, index) => (
            <div
              key={index}
              className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Grid container spacing={4} className="features-grid">
          <Grid item xs={12} md={3}>
            <Paper elevation={3} className="feature-card">
              <Box className="feature-icon-wrapper posts">
                <ForumIcon className="feature-icon" />
              </Box>
              <Typography variant="h6" className="feature-title">
                Engaging Posts
              </Typography>
              <Typography className="feature-description">
                Share your thoughts, insights, and experiences with the community.
              </Typography>
              <Button 
                component={Link} 
                to="/posts" 
                variant="outlined" 
                color="primary"
                className="feature-button"
              >
                Explore Posts
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper elevation={3} className="feature-card">
              <Box className="feature-icon-wrapper progress">
                <TimelineIcon className="feature-icon" />
              </Box>
              <Typography variant="h6" className="feature-title">
                Track Progress
              </Typography>
              <Typography className="feature-description">
                Monitor your learning journey with detailed analytics and insights.
              </Typography>
              <Button 
                component={Link} 
                to="/progress" 
                variant="outlined" 
                color="primary"
                className="feature-button"
              >
                View Progress
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper elevation={3} className="feature-card">
              <Box className="feature-icon-wrapper interactions">
                <GroupIcon className="feature-icon" />
              </Box>
              <Typography variant="h6" className="feature-title">
                Community Interactions
              </Typography>
              <Typography className="feature-description">
                Connect, collaborate, and learn from fellow learners.
              </Typography>
              <Button 
                component={Link} 
                to="/interactions" 
                variant="outlined" 
                color="primary"
                className="feature-button"
              >
                Join Discussions
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper elevation={3} className="feature-card">
              <Box className="feature-icon-wrapper plans">
                <TrendingUpIcon className="feature-icon" />
              </Box>
              <Typography variant="h6" className="feature-title">
                Learning Plans
              </Typography>
              <Typography className="feature-description">
                Create and follow structured learning paths to achieve your goals.
              </Typography>
              <Button 
                component={Link} 
                to="/learning-plans" 
                variant="outlined" 
                color="primary"
                className="feature-button"
              >
                View Plans
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </section>

      {/* New Social Features Section */}
      <section className="social-section">
        <Typography variant="h4" className="social-title">
          Connect with Other Learners
        </Typography>
        <Box display="flex" justifyContent="center" gap={2} mt={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PeopleIcon />}
            onClick={handleOpenUserModal}
          >
            Find Other Users
          </Button>
        
        </Box>
      </section>

      {/* User List Modal */}
      <Modal
        open={openUserModal}
        onClose={handleCloseUserModal}
        aria-labelledby="user-list-modal"
      >
        <Box className="user-modal">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography id="user-list-modal" variant="h6">
              Find Other Users
            </Typography>
            <IconButton onClick={handleCloseUserModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <UserList />
        </Box>
      </Modal>

      {/* Parallax Section */}
      <section className="parallax-section">
        <div className="parallax-content">
          <Typography variant="h2" className="parallax-title">
            Transform Your Learning Experience
          </Typography>
          <Typography variant="h5" className="parallax-subtitle">
            Join thousands of learners who are achieving their goals with InkSpire
          </Typography>
          <Button 
            component={Link} 
            to="/signup" 
            variant="contained" 
            size="large"
            className="parallax-button"
          >
            Join Now
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <Grid container spacing={4} className="stats-grid">
          <Grid item xs={12} md={3}>
            <Paper elevation={3} className="stat-card">
              <Typography variant="h3" className="stat-number">1.2K+</Typography>
              <Typography className="stat-label">Active Learners</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper elevation={3} className="stat-card">
              <Typography variant="h3" className="stat-number">500+</Typography>
              <Typography className="stat-label">Learning Plans</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper elevation={3} className="stat-card">
              <Typography variant="h3" className="stat-number">2.5K+</Typography>
              <Typography className="stat-label">Community Posts</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper elevation={3} className="stat-card">
              <Typography variant="h3" className="stat-number">10K+</Typography>
              <Typography className="stat-label">Interactions</Typography>
            </Paper>
          </Grid>
        </Grid>
      </section>

      {/* Community Section */}
      <section className="community-section">
        <div className="community-content">
          <Typography variant="h2" className="community-title">
            Join Our Learning Community
          </Typography>
          <Typography variant="h6" className="community-subtitle">
            Connect with fellow learners, share experiences, and grow together
          </Typography>
          <Grid container spacing={4} className="community-features">
            <Grid item xs={12} md={4}>
              <Paper elevation={0} className="community-card">
                <Typography variant="h5">Share Knowledge</Typography>
                <Typography>
                  Create and share learning resources with the community
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} className="community-card">
                <Typography variant="h5">Get Support</Typography>
                <Typography>
                  Ask questions and receive help from experienced learners
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} className="community-card">
                <Typography variant="h5">Track Progress</Typography>
                <Typography>
                  Monitor your learning journey and celebrate milestones
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;