import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  IconButton, 
  Button,
  TextField,
  Divider
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  const handleSubscribe = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
  };

  return (
    <Box component="footer" className="footer">
      <Container className="footer-container">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Box className="footer-brand">
              <Typography variant="h6" className="footer-logo">
                InkSpire
              </Typography>
              <Typography variant="body2" className="footer-description">
                Empowering learners worldwide through structured learning paths and 
                community-driven knowledge sharing.
              </Typography>
              <Box className="social-icons">
                <IconButton color="primary" aria-label="Facebook">
                  <FacebookIcon />
                </IconButton>
                <IconButton color="primary" aria-label="Twitter">
                  <TwitterIcon />
                </IconButton>
                <IconButton color="primary" aria-label="LinkedIn">
                  <LinkedInIcon />
                </IconButton>
                <IconButton color="primary" aria-label="Instagram">
                  <InstagramIcon />
                </IconButton>
              </Box>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} md={2}>
            <Typography variant="h6" className="footer-title">
              Quick Links
            </Typography>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </Grid>

          {/* Resources */}
          <Grid item xs={6} md={2}>
            <Typography variant="h6" className="footer-title">
              Resources
            </Typography>
            <ul className="footer-links">
              <li><Link to="/learning-plans">Learning Plans</Link></li>
              <li><Link to="/community">Community</Link></li>
              <li><Link to="/tutorials">Tutorials</Link></li>
              <li><Link to="/support">Support</Link></li>
            </ul>
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" className="footer-title">
              Stay Updated
            </Typography>
            <Typography variant="body2" className="newsletter-text">
              Subscribe to our newsletter for the latest updates and learning resources.
            </Typography>
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <TextField
                variant="outlined"
                placeholder="Enter your email"
                fullWidth
                className="newsletter-input"
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                className="subscribe-button"
              >
                Subscribe
              </Button>
            </form>
          </Grid>
        </Grid>

        <Divider className="footer-divider" />

        {/* Bottom Bar */}
        <Box className="footer-bottom">
          <Typography variant="body2" className="copyright">
            © {new Date().getFullYear()} InkSpire. All rights reserved.
          </Typography>
          <Box className="legal-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/cookies">Cookie Policy</Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;