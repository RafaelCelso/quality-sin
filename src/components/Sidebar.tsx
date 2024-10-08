import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, PhoneCall, Settings, Users, BookOpen, LogOut, User, Shield, Briefcase, FolderOpen } from 'lucide-react';
import { auth, signOut } from '../firebase';
import usePermissions from '../hooks/usePermissions';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { checkPermission } = usePermissions();

  const menuItems = [
    { icon: <Home size={20} />, text: 'Início', link: '/dashboard', permission: 'Visualizar Dashboard' },
    { icon: <PhoneCall size={20} />, text: 'Monitorias', link: '/monitorias', permission: 'Visualizar Dashboard' },
    { icon: <Settings size={20} />, text: 'Calibração', link: '/calibracao', permission: 'Visualizar Dashboard' },
    { icon: <Users size={20} />, text: 'Colaboradores', link: '/colaboradores', permission: 'Visualizar Colaboradores' },
    { icon: <BookOpen size={20} />, text: 'Documentação', link: '/documentacao', permission: 'Visualizar Documentação' },
    { icon: <BookOpen size={20} />, text: 'Treinamentos', link: '/treinamentos', permission: 'Visualizar Treinamentos' },
    { icon: <User size={20} />, text: 'Perfil', link: '/profile', permission: 'Acessar Perfil' },
    { icon: <Users size={20} />, text: 'Usuários', link: '/usuarios', permission: 'Visualizar Usuários' },
    { icon: <Shield size={20} />, text: 'Permissões', link: '/permissoes', permission: 'Gerenciar Permissões' },
    { icon: <Briefcase size={20} />, text: 'Cargos', link: '/cargos', permission: 'Visualizar Cargos' },
    { icon: <FolderOpen size={20} />, text: 'Projetos', link: '/projetos', permission: 'Visualizar Projetos' },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="bg-emerald-800 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <img src="/sin-solution-logo.png" alt="SIN Solution Logo" className="w-32 mx-auto" />
      </div>
      <nav>
        <ul>
          {menuItems.map((item, index) => (
            checkPermission(item.permission) && (
              <li key={index} className="mb-2">
                <Link to={item.link} className="flex items-center p-2 hover:bg-emerald-700 rounded">
                  {item.icon}
                  <span className="ml-2">{item.text}</span>
                </Link>
              </li>
            )
          ))}
        </ul>
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center p-2 hover:bg-emerald-700 rounded mt-8 w-full"
      >
        <LogOut size={20} />
        <span className="ml-2">Sair</span>
      </button>
    </div>
  );
};

export default Sidebar;