import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Shield, Save, User, Users, FileText, Trash2, Settings } from 'lucide-react';
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
    { nome: 'Visualizar Colaboradores', icon: <Users size={20} /> },
    { nome: 'Criar Colaborador', icon: <User size={20} /> },
    { nome: 'Editar Colaborador', icon: <User size={20} /> },
    { nome: 'Excluir Colaborador', icon: <Trash2 size={20} /> },
    { nome: 'Visualizar Usuários', icon: <Users size={20} /> },
    { nome: 'Criar Usuário', icon: <User size={20} /> },
    { nome: 'Editar Usuário', icon: <User size={20} /> },
    { nome: 'Excluir Usuário', icon: <Trash2 size={20} /> },
    { nome: 'Gerenciar Permissões', icon: <Settings size={20} /> },
  ];

  useEffect(() => {
    fetchPermissoes();
  }, []);

  const fetchPermissoes = async () => {
    try {
      const permissoesRef = collection(db, 'permissoes');
      const snapshot = await getDocs(permissoesRef);
      const permissoesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Permissao[];
      setPermissoes(permissoesData);
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

  const salvarPermissoes = async () => {
    setSuccessMessage('');
    setErrorMessage('');
    try {
      for (const permissao of permissoes) {
        const permissaoRef = doc(db, 'permissoes', permissao.id);
        await updateDoc(permissaoRef, { acessos: permissao.acessos });
      }
      setSuccessMessage('Permissões atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      setErrorMessage('Erro ao salvar permissões. Por favor, tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-4">Permissões</h1>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center text-gray-800">
          <Shield className="mr-2 text-emerald-600" size={32} />
          Gerenciamento de Permissões
        </h1>
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {permissoes.map(permissao => (
            <div key={permissao.id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">{permissao.nome}</h2>
              <div className="space-y-4">
                {acessos.map(acesso => (
                  <div key={acesso.nome} className="flex items-center justify-between">
                    <div className="flex items-center">
                      {acesso.icon}
                      <span className="ml-2 text-gray-700">{acesso.nome}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={permissao.acessos[acesso.nome] || false}
                        onChange={(e) => handlePermissaoChange(permissao.id, acesso.nome, e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-end">
          <button
            onClick={salvarPermissoes}
            className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition duration-300 ease-in-out flex items-center text-lg font-semibold shadow-md"
          >
            <Save size={24} className="mr-2" />
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default Permissoes;