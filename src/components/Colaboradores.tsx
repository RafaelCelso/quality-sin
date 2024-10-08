import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { db, collection, getDocs, query, orderBy, limit, addDoc, updateDoc, deleteDoc, doc } from '../firebase';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import usePermissions from '../hooks/usePermissions';

const Colaboradores: React.FC = () => {
  const navigate = useNavigate();
  const { checkPermission, loading: permissionsLoading } = usePermissions();
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [cargos, setCargos] = useState<any[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<any>(null);
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

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este colaborador?")) {
      try {
        await deleteDoc(doc(db, 'colaboradores', id));
        fetchColaboradores();
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
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Colaboradores</h1>
        
        <div className="mb-4 flex items-center space-x-4">
          <input
            type="text"
            placeholder="Buscar por nome ou email"
            value={searchTerm}
            onChange={handleSearchChange}
            className="border rounded px-2 py-1 flex-grow"
          />
          <button
            onClick={() => setShowModal(true)}
            className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Novo Colaborador
          </button>
        </div>

        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Nome</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Cargo</th>
              <th className="py-2 px-4 border-b text-left">Projeto</th>
              <th className="py-2 px-4 border-b text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredColaboradores.map((colaborador) => (
              <tr key={colaborador.id}>
                <td className="py-2 px-4 border-b">{colaborador.nome}</td>
                <td className="py-2 px-4 border-b">{colaborador.email}</td>
                <td className="py-2 px-4 border-b">{colaborador.cargo}</td>
                <td className="py-2 px-4 border-b">{colaborador.projeto}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleEdit(colaborador)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(colaborador.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold mb-4">{editingColaborador ? 'Editar Colaborador' : 'Novo Colaborador'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    name="nome"
                    value={editingColaborador ? editingColaborador.nome : novoColaborador.nome}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Cargo</label>
                  <select
                    name="cargo"
                    value={editingColaborador ? editingColaborador.cargo : novoColaborador.cargo}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                  >
                    {editingColaborador ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Colaboradores;