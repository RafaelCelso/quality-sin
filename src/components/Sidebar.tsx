import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  PhoneCall,
  Settings,
  Users,
  BookOpen,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import { auth, signOut } from "../firebase";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: <Home size={20} />, text: "Início", link: "/dashboard" },
    { icon: <PhoneCall size={20} />, text: "Monitorias", link: "/monitorias" },
    { icon: <Settings size={20} />, text: "Calibração", link: "/calibracao" },
    {
      icon: <Users size={20} />,
      text: "Colaboradores",
      link: "/colaboradores",
    },
    {
      icon: <BookOpen size={20} />,
      text: "Documentação",
      link: "/documentacao",
    },
    {
      icon: <BookOpen size={20} />,
      text: "Treinamentos",
      link: "/treinamentos",
    },
    { icon: <User size={20} />, text: "Perfil", link: "/perfil" },
    { icon: <Users size={20} />, text: "Usuários", link: "/usuarios" },
    { icon: <Shield size={20} />, text: "Permissões", link: "/permissoes" },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="flex items-center justify-center mb-8">
        <img src="/sin--logo.png" alt="Logo" className="w-12 h-12" />
      </div>
      <nav>
        <ul>
          {menuItems.map((item, index) => (
            <li key={index} className="mb-2">
              <Link
                to={item.link}
                className="flex items-center p-2 rounded hover:bg-gray-700"
              >
                {item.icon}
                <span className="ml-2">{item.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center p-2 rounded hover:bg-gray-700 w-full"
        >
          <LogOut size={20} />
          <span className="ml-2">Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
