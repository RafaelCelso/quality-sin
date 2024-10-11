import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import AssistenteDashboard from './components/AssistenteDashboard';
import Profile from './components/Profile';
import Colaboradores from './components/Colaboradores';
import Usuarios from './components/Usuarios';
import Monitorias from './components/Monitorias';
import MonitoriaLigacao from './components/MonitoriaLigacao';
import MonitoriaEmail from './components/MonitoriaEmail';
import MonitoriaChat from './components/MonitoriaChat';
import Permissoes from './components/Permissoes';
import Cargos from './components/Cargos';
import Projetos from './components/Projetos';
import usePermissions from './hooks/usePermissions';
import initializePermissions from './utils/initializePermissions';

interface ProtectedRouteProps {
  element: React.ReactElement;
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, requiredPermission }) => {
  const { checkPermission } = usePermissions();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userPermissao, setUserPermissao] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        const userDoc = await getDocs(query(collection(db, 'usuarios'), where('uid', '==', user.uid)));
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          setUserPermissao(userData.permissao);
        }
      } else {
        setIsAuthenticated(false);
        setUserPermissao(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredPermission && !checkPermission(requiredPermission)) {
    return <Navigate to="/monitorias" replace />;
  }

  if (userPermissao === 'Assistente' && window.location.pathname !== '/monitorias') {
    return <Navigate to="/monitorias" replace />;
  }

  return element;
};

function App() {
  const { loading } = usePermissions();

  useEffect(() => {
    initializePermissions();
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/assistente" element={<ProtectedRoute element={<AssistenteDashboard />} requiredPermission="Visualizar Dashboard" />} />
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} requiredPermission="Acessar Perfil" />} />
        <Route path="/colaboradores" element={<ProtectedRoute element={<Colaboradores />} requiredPermission="Visualizar Colaboradores" />} />
        <Route path="/usuarios" element={<ProtectedRoute element={<Usuarios />} requiredPermission="Visualizar Usuários" />} />
        <Route path="/monitorias" element={<ProtectedRoute element={<Monitorias />} requiredPermission="Visualizar Monitoria" />} />
        <Route path="/monitoria-ligacao" element={<ProtectedRoute element={<MonitoriaLigacao />} requiredPermission="Criar Monitoria" />} />
        <Route path="/monitoria-email" element={<ProtectedRoute element={<MonitoriaEmail />} requiredPermission="Criar Monitoria" />} />
        <Route path="/monitoria-chat" element={<ProtectedRoute element={<MonitoriaChat />} requiredPermission="Criar Monitoria" />} />
        <Route path="/permissoes" element={<ProtectedRoute element={<Permissoes />} requiredPermission="Gerenciar Permissões" />} />
        <Route path="/cargos" element={<ProtectedRoute element={<Cargos />} requiredPermission="Visualizar Cargos" />} />
        <Route path="/projetos" element={<ProtectedRoute element={<Projetos />} requiredPermission="Visualizar Projetos" />} />
      </Routes>
    </Router>
  );
}

export default App;