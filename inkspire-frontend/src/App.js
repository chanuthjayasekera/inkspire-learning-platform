import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { FollowProvider } from './context/FollowContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ForgotPassword from './components/auth/ForgotPassword';
import Header from './components/Header';
import Footer from './components/Footer';
import PlanList from './components/PlanList';
import CreatePlan from './components/CreatePlan';
import Reminders from './components/Reminders';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import LearningPlans from './components/LearningPlans';
import PrivateRoute from './components/PrivateRoute';
import OAuthSuccessPage from './components/OAuthSuccessPage';
import FollowedPlans from './components/FollowedPlans';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>
          <FollowProvider>
            <div className="app">
              <Header />
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/oauth-success" element={<OAuthSuccessPage />} />

                {/* Private Routes */}
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/followed-plans"
                  element={
                    <PrivateRoute>
                      <FollowedPlans />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/learning-plans"
                  element={
                    <PrivateRoute>
                      <LearningPlans />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/plans"
                  element={
                    <PrivateRoute>
                      <PlanList />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/create-plan"
                  element={
                    <PrivateRoute>
                      <CreatePlan />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/reminders"
                  element={
                    <PrivateRoute>
                      <Reminders />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
              </Routes>
              <Footer />
            </div>
          </FollowProvider>
        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;
