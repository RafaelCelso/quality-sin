import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, PhoneCall, Users, LogOut, User, Shield, Briefcase, FolderOpen } from 'lucide-react';
import { auth, signOut, db } from '../firebase';
import usePermissions from '../hooks/usePermissions';
import { collection, query, where, getDocs } from 'firebase/firestore';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { checkPermission } = usePermissions();
  const [userPermissao, setUserPermissao] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPermissao = async () => {
      if (auth.currentUser) {
        const userQuery = query(collection(db, 'usuarios'), where('uid', '==', auth.currentUser.uid));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setUserPermissao(userData.permissao);
        }
      }
    };

    fetchUserPermissao();
  }, []);

  const menuItems = [
    { icon: <Home size={20} />, text: 'Início', link: '/dashboard', permission: 'Visualizar Dashboard' },
    { icon: <PhoneCall size={20} />, text: 'Monitorias', link: '/monitorias', permission: 'Visualizar Dashboard' },
    { icon: <Users size={20} />, text: 'Colaboradores', link: '/colaboradores', permission: 'Visualizar Colaboradores' },
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
        <img src="/sin-logo.png" alt="SIN Solution Logo" className="w-32 mx-auto" />
      </div>
      <nav>
        <ul>
          {menuItems.map((item, index) => (
            ((userPermissao === 'Assistente' && (item.text === 'Monitorias' || item.text === 'Perfil')) || 
             (userPermissao !== 'Assistente' && checkPermission(item.permission))) && (
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