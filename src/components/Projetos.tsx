import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from '../firebase';
import { Plus, Edit, Trash2, AlertTriangle, X } from 'lucide-react';
import usePermissions from '../hooks/usePermissions';

const Projetos: React.FC = () => {
  const navigate = useNavigate();
  const { checkPermission, loading: permissionsLoading } = usePermissions();
  const [projetos, setProjetos] = useState<any[]>([]);
  const [supervisores, setSupervisores] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProjeto, setEditingProjeto] = useState<any>(null);
  const [projetoToDelete, setProjetoToDelete] = useState<any>(null);
  const [novoProjeto, setNovoProjeto] = useState({ nome: '', descricao: '', supervisorId: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!permissionsLoading) {
      if (checkPermission('Visualizar Projetos')) {
        fetchProjetos();
        fetchSupervisores();
      } else {
        navigate('/');
      }
    }
  }, [checkPermission, navigate, permissionsLoading]);

  const fetchProjetos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'projetos'));
      const fetchedProjetos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjetos(fetchedProjetos);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
      setError("Erro ao carregar projetos. Por favor, tente novamente.");
      setLoading(false);
    }
  };

  const fetchSupervisores = async () => {
    try {
      const supervisoresQuery = query(collection(db, 'usuarios'), where('cargo', '==', 'Supervisor'));
      const querySnapshot = await getDocs(supervisoresQuery);
      const fetchedSupervisores = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSupervisores(fetchedSupervisores);
    } catch (error) {
      console.error("Erro ao buscar supervisores:", error);
      setError("Erro ao carregar supervisores. Por favor, tente novamente.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editingProjeto) {
      setEditingProjeto(prev => ({ ...prev, [name]: value }));
    } else {
      setNovoProjeto(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProjeto) {
        await updateDoc(doc(db, 'projetos', editingProjeto.id), editingProjeto);
      } else {
        await addDoc(collection(db, 'projetos'), novoProjeto);
      }
      setShowModal(false);
      fetchProjetos();
      setEditingProjeto(null);
      setNovoProjeto({ nome: '', descricao: '', supervisorId: '' });
    } catch (error) {
      console.error("Erro ao salvar projeto:", error);
      setError("Erro ao salvar projeto. Por favor, tente novamente.");
    }
  };

  const handleEdit = (projeto: any) => {
    setEditingProjeto(projeto);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (projetoToDelete) {
      try {
        await deleteDoc(doc(db, 'projetos', projetoToDelete.id));
        fetchProjetos();
        setShowDeleteModal(false);
      } catch (error) {
        console.error("Erro ao excluir projeto:", error);
        setError("Erro ao excluir projeto. Por favor, tente novamente.");
      }
    }
  };

  if (loading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Projetos</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Novo Projeto
            </button>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supervisor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projetos.map((projeto) => (
                  <tr key={projeto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{projeto.nome}</td>
                    <td className="px-6 py-4">{projeto.descricao}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {supervisores.find(s => s.id === projeto.supervisorId)?.nome || 'Não atribuído'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(projeto)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => {
                          setProjetoToDelete(projeto);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{editingProjeto ? 'Editar Projeto' : 'Novo Projeto'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    name="nome"
                    value={editingProjeto ? editingProjeto.nome : novoProjeto.nome}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <textarea
                    name="descricao"
                    value={editingProjeto ? editingProjeto.descricao : novoProjeto.descricao}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                    rows={3}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Supervisor</label>
                  <select
                    name="supervisorId"
                    value={editingProjeto ? editingProjeto.supervisorId : novoProjeto.supervisorId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                    required
                  >
                    <option value="">Selecione um supervisor</option>
                    {supervisores.map((supervisor) => (
                      <option key={supervisor.id} value={supervisor.id}>{supervisor.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors duration-200"
                  >
                    {editingProjeto ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-center mb-4">Excluir Projeto</h3>
              <p className="text-center mb-6">
                Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projetos;