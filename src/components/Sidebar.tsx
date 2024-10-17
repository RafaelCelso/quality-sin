import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Users, FileText, Settings, LogOut, Briefcase, Target, Shield, BarChart2, UserCheck, UserPlus } from 'lucide-react';
import { auth, signOut } from '../firebase';
import usePermissions from '../hooks/usePermissions';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { checkPermission } = usePermissions();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('userPermissao');
      localStorage.removeItem('userCargo');
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="bg-emerald-800 text-white w-64 min-h-screen p-4">
      <nav className="mt-8">
        <ul className="space-y-2">
          {checkPermission('Visualizar Dashboard') && (
            <li>
              <Link to="/dashboard" className="flex items-center p-2 hover:bg-emerald-700 rounded">
                <BarChart2 className="mr-2" />
                Dashboard
              </Link>
            </li>
          )}
          {checkPermission('Visualizar Monitorias') && (
            <li>
              <Link to="/monitorias" className="flex items-center p-2 hover:bg-emerald-700 rounded">
                <FileText className="mr-2" />
                Monitorias
              </Link>
            </li>
          )}
          {checkPermission('Visualizar Colaboradores') && (
            <li>
              <Link to="/colaboradores" className="flex items-center p-2 hover:bg-emerald-700 rounded">
                <UserCheck className="mr-2" />
                Colaboradores
              </Link>
            </li>
          )}
          {checkPermission('Visualizar Usuários') && (
            <li>
              <Link to="/usuarios" className="flex items-center p-2 hover:bg-emerald-700 rounded">
                <UserPlus className="mr-2" />
                Usuários
              </Link>
            </li>
          )}
          {checkPermission('Visualizar Cargos') && (
            <li>
              <Link to="/cargos" className="flex items-center p-2 hover:bg-emerald-700 rounded">
                <Briefcase className="mr-2" />
                Cargos
              </Link>
            </li>
          )}
          {checkPermission('Visualizar Projetos') && (
            <li>
              <Link to="/projetos" className="flex items-center p-2 hover:bg-emerald-700 rounded">
                <Target className="mr-2" />
                Projetos
              </Link>
            </li>
          )}
          {checkPermission('Gerenciar Permissões') && (
            <li>
              <Link to="/permissoes" className="flex items-center p-2 hover:bg-emerald-700 rounded">
                <Shield className="mr-2" />
                Permissões
              </Link>
            </li>
          )}
          <li>
            <Link to="/profile" className="flex items-center p-2 hover:bg-emerald-700 rounded">
              <Users className="mr-2" />
              Perfil
            </Link>
          </li>
          <li>
            <button onClick={handleLogout} className="flex items-center p-2 hover:bg-emerald-700 rounded w-full text-left">
              <LogOut className="mr-2" />
              Sair
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
