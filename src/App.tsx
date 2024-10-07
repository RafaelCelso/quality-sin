import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Colaboradores from './components/Colaboradores';
import Usuarios from './components/Usuarios';
import Monitorias from './components/Monitorias';
import MonitoriaLigacao from './components/MonitoriaLigacao';
import MonitoriaEmail from './components/MonitoriaEmail';
import MonitoriaChat from './components/MonitoriaChat';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/" />} 
          />
          <Route 
            path="/perfil" 
            element={user ? <Profile /> : <Navigate to="/" />} 
          />
          <Route 
            path="/colaboradores" 
            element={user ? <Colaboradores /> : <Navigate to="/" />} 
          />
          <Route 
            path="/usuarios" 
            element={user ? <Usuarios /> : <Navigate to="/" />} 
          />
          <Route 
            path="/monitorias" 
            element={user ? <Monitorias /> : <Navigate to="/" />} 
          />
          <Route 
            path="/monitoria-ligacao" 
            element={user ? <MonitoriaLigacao /> : <Navigate to="/" />} 
          />
          <Route 
            path="/monitoria-email" 
            element={user ? <MonitoriaEmail /> : <Navigate to="/" />} 
          />
          <Route 
            path="/monitoria-chat" 
            element={user ? <MonitoriaChat /> : <Navigate to="/" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;