import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { userInfo } = useContext(AuthContext);

  return userInfo ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
