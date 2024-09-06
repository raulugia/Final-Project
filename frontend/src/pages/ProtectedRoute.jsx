import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../utils/firebase";

//All the code in this file was written without assistance 

//ensure uer is authenticated before displaying components

const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if(loading) {
    return <div>Loading...</div>
  }
  
  return user ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
