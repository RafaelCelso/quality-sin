import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Shield, Save, User, Users, FileText, Trash2, Settings, Briefcase, FolderOpen, AlertCircle, Check, Eye } from 'lucide-react';
import { db, collection, getDocs, doc, updateDoc } from '../firebase';

interface Permissao {
  id: string;
  nome: string;
  acessos: {
    [key: string]: boolean;
  };
}

const Permissoes: React.FC = () => {
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const acessos = [
    { nome: 'Visualizar Dashboard', icon: <FileText size={20} /> },
    { nome: 'Criar Monitoria', icon: <FileText size={20} /> },
    { nome: 'Editar Monitoria', icon: <FileText size={20} /> },
    { nome: 'Excluir Monitoria', icon: <Trash2 size={20} /> },
    { nome: 'Visualizar Monitoria', icon: <Eye size={20} /> },
    { nome: 'Visualizar Colaboradores', icon: <Users size={20} /> },
    { nome: 'Criar Colaborador', icon: <User size={20} /> },
    { nome: 'Editar Colaborador', icon: <User size={20} /> },
    { nome: 'Excluir Colaborador', icon: <Trash2 size={20} /> },
    { nome: 'Visualizar Usuários', icon: <Users size={20} /> },
    { nome: 'Criar Usuário', icon: <User size={20} /> },
    { nome: 'Editar Usuário', icon: <User size={20} /> },
    { nome: 'Excluir Usuário', icon: <Trash2 size={20} /> },
    { nome: 'Gerenciar Permissões', icon: <Settings size={20} /> },
    { nome: 'Visualizar Cargos', icon: <Briefcase size={20} /> },
    { nome: 'Criar Cargo', icon: <Briefcase size={20} /> },
    { nome: 'Editar Cargo', icon: <Briefcase size={20} /> },
    { nome: 'Excluir Cargo', icon: <Trash2 size={20} /> },
    { nome: 'Visualizar Projetos', icon: <FolderOpen size={20} /> },
    { nome: 'Criar Projeto', icon: <FolderOpen size={20} /> },
    { nome: 'Editar Projeto', icon: <FolderOpen size={20} /> },
    { nome: 'Excluir Projeto', icon: <Trash2 size={20} /> },
    { nome: 'Acessar Perfil', icon: <User size={20} /> },
    { nome: 'Editar Perfil', icon: <User size={20} /> },
  ];

  useEffect(() => {
    fetchPermissoes();
  }, []);

  const fetchPermissoes = async () => {
    try {
      const permissoesRef = collection(db, 'permissoes');
      const snapshot = await getDocs(permissoesRef);
      const fetchedPermissoes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Permissao));
      setPermissoes(fetchedPermissoes);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      setErrorMessage('Erro ao carregar permissões. Por favor, tente novamente.');
      setLoading(false);
    }
  };

  const handlePermissaoChange = (permissaoId: string, acesso: string, value: boolean) => {
    setPermissoes(prevPermissoes =>
      prevPermissoes.map(permissao =>
        permissao.id === permissaoId
          ? { ...permissao, acessos: { ...permissao.acessos, [acesso]: value } }
          : permissao
      )
    );
  };

  const handleSave = async () => {
    try {
      for (const permissao of permissoes) {
        const permissaoRef = doc(db, 'permissoes', permissao.id);
        await updateDoc(permissaoRef, { acessos: permissao.acessos });
      }
      setSuccessMessage('Permissões salvas com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      setErrorMessage('Erro ao salvar permissões. Por favor, tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Gerenciar Permissões</h1>
            <button
              onClick={handleSave}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center"
            >
              <Save size={20} className="mr-2" />
              Salvar Alterações
            </button>
          </div>

          {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg shadow-md flex items-center">
              <Check className="mr-2" size={24} />
              <p>{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-md flex items-center">
              <AlertCircle className="mr-2" size={24} />
              <p>{errorMessage}</p>
            </div>
          )}

          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissão</th>
                    {permissoes.map(permissao => (
                      <th key={permissao.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{permissao.nome}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {acessos.map(acesso => (
                    <tr key={acesso.nome} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-emerald-100 rounded-full">
                            {acesso.icon}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{acesso.nome}</div>
                          </div>
                        </div>
                      </td>
                      {permissoes.map(permissao => (
                        <td key={`${permissao.id}-${acesso.nome}`} className="px-6 py-4 whitespace-nowrap text-center">
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={permissao.acessos[acesso.nome] || false}
                              onChange={(e) => handlePermissaoChange(permissao.id, acesso.nome, e.target.checked)}
                              className="form-checkbox h-5 w-5 text-emerald-600 transition duration-150 ease-in-out"
                            />
                            <span className="ml-2 text-sm text-gray-600">
                              {permissao.acessos[acesso.nome] ? 'Permitido' : 'Bloqueado'}
                            </span>
                          </label>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Permissoes;