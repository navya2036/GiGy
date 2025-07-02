import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import GigListPage from './pages/GigListPage';
import GigDetailsPage from './pages/GigDetailsPage';
import CreateGigPage from './pages/CreateGigPage';
import EditGigPage from './pages/EditGigPage';
import MyGigsPage from './pages/MyGigsPage';
import MyAssignmentsPage from './pages/MyAssignmentsPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import ApplicationsPage from './pages/ApplicationsPage';
import MessagesPage from './pages/MessagesPage';
import ChatPage from './pages/ChatPage';
import NotFoundPage from './pages/NotFoundPage';

// Route protection
import PrivateRoute from './components/routing/PrivateRoute';

// CSS Import
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pt-16 container">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/gigs" element={<GigListPage />} />
                <Route path="/gigs/:id" element={<GigDetailsPage />} />
                
                <Route 
                  path="/profile" 
                  element={
                    <PrivateRoute>
                      <ProfilePage />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/gigs/create" 
                  element={
                    <PrivateRoute>
                      <CreateGigPage />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/gigs/edit/:id" 
                  element={
                    <PrivateRoute>
                      <EditGigPage />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/my-gigs" 
                  element={
                    <PrivateRoute>
                      <MyGigsPage />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/my-assignments" 
                  element={
                    <PrivateRoute>
                      <MyAssignmentsPage />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/my-applications" 
                  element={
                    <PrivateRoute>
                      <MyApplicationsPage />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/applications/:gigId" 
                  element={
                    <PrivateRoute>
                      <ApplicationsPage />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/messages" 
                  element={
                    <PrivateRoute>
                      <MessagesPage />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/messages/:userId" 
                  element={
                    <PrivateRoute>
                      <ChatPage />
                    </PrivateRoute>
                  } 
                />
                
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
