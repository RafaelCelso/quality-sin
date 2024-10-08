import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { db, collection, getDocs, query, orderBy, limit, addDoc, updateDoc, deleteDoc, doc } from '../firebase';
import { Plus, Search, Edit, Trash2, AlertTriangle, X } from 'lucide-react';
import usePermissions from '../hooks/usePermissions';

const Colaboradores: React.FC = () => {
  const navigate = useNavigate();
  const { checkPermission, loading: permissionsLoading } = usePermissions();
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [cargos, setCargos] = useState<any[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<any>(null);
  const [colaboradorToDelete, setColaboradorToDelete] = useState<any>(null);
  const [novoColaborador, setNovoColaborador] = useState({
    nome: '',
    email: '',
    cargo: '',
    projeto: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!permissionsLoading) {
      if (checkPermission('Visualizar Colaboradores')) {
        fetchColaboradores();
        fetchCargos();
        fetchProjetos();
      } else {
        navigate('/');
      }
    }
  }, [permissionsLoading, checkPermission, navigate]);

  const fetchColaboradores = async () => {
    try {
      const q = query(collection(db, 'colaboradores'), orderBy('nome'), limit(100));
      const querySnapshot = await getDocs(q);
      const fetchedColaboradores = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setColaboradores(fetchedColaboradores);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar colaboradores:", error);
      setError("Erro ao carregar colaboradores. Por favor, tente novamente.");
      setLoading(false);
    }
  };

  const fetchCargos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'cargos'));
      const fetchedCargos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCargos(fetchedCargos);
    } catch (error) {
      console.error("Erro ao buscar cargos:", error);
      setError("Erro ao carregar cargos. Por favor, tente novamente.");
    }
  };

  const fetchProjetos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'projetos'));
      const fetchedProjetos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjetos(fetchedProjetos);
    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
      setError("Erro ao carregar projetos. Por favor, tente novamente.");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editingColaborador) {
      setEditingColaborador(prev => ({ ...prev, [name]: value }));
    } else {
      setNovoColaborador(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingColaborador) {
        await updateDoc(doc(db, 'colaboradores', editingColaborador.id), editingColaborador);
      } else {
        await addDoc(collection(db, 'colaboradores'), novoColaborador);
      }
      setShowModal(false);
      fetchColaboradores();
      setEditingColaborador(null);
      setNovoColaborador({ nome: '', email: '', cargo: '', projeto: '' });
    } catch (error) {
      console.error("Erro ao salvar colaborador:", error);
      setError("Erro ao salvar colaborador. Por favor, tente novamente.");
    }
  };

  const handleEdit = (colaborador: any) => {
    setEditingColaborador(colaborador);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (colaboradorToDelete) {
      try {
        await deleteDoc(doc(db, 'colaboradores', colaboradorToDelete.id));
        fetchColaboradores();
        setShowDeleteModal(false);
      } catch (error) {
        console.error("Erro ao excluir colaborador:", error);
        setError("Erro ao excluir colaborador. Por favor, tente novamente.");
      }
    }
  };

  const filteredColaboradores = colaboradores.filter(colaborador =>
    colaborador.nome.toLowerCase().includes(searchTerm) ||
    colaborador.email.toLowerCase().includes(searchTerm)
  );

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
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Colaboradores</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Novo Colaborador
            </button>
          </div>
          
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nome ou email"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projeto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredColaboradores.map((colaborador) => (
                  <tr key={colaborador.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{colaborador.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{colaborador.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{colaborador.cargo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{colaborador.projeto}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(colaborador)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => {
                          setColaboradorToDelete(colaborador);
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
                <h2 className="text-2xl font-bold">{editingColaborador ? 'Editar Colaborador' : 'Novo Colaborador'}</h2>
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
                    value={editingColaborador ? editingColaborador.nome : novoColaborador.nome}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editingColaborador ? editingColaborador.email : novoColaborador.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Cargo</label>
                  <select
                    name="cargo"
                    value={editingColaborador ? editingColaborador.cargo : novoColaborador.cargo}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                    required
                  >
                    <option value="">Selecione um cargo</option>
                    {cargos.map((cargo) => (
                      <option key={cargo.id} value={cargo.nome}>{cargo.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Projeto</label>
                  <select
                    name="projeto"
                    value={editingColaborador ? editingColaborador.projeto : novoColaborador.projeto}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                    required
                  >
                    <option value="">Selecione um projeto</option>
                    {projetos.map((projeto) => (
                      <option key={projeto.id} value={projeto.nome}>{projeto.nome}</option>
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
                    {editingColaborador ? 'Atualizar' : 'Salvar'}
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
              <h3 className="text-lg font-bold text-center mb-4">Excluir Colaborador</h3>
              <p className="text-center mb-6">
                Tem certeza que deseja excluir este colaborador? Esta ação não pode ser desfeita.
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

export default Colaboradores;