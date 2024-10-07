import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Users, Plus, Search } from 'lucide-react';
import { db, collection, getDocs, query, where, orderBy, limit } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Colaboradores: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [novoColaborador, setNovoColaborador] = useState({
    nome: '',
    projeto: '',
    cargo: '',
    supervisor: ''
  });
  const navigate = useNavigate();

  const fetchColaboradores = async () => {
    try {
      const q = query(collection(db, 'colaboradores'), orderBy('nome'), limit(100));
      const querySnapshot = await getDocs(q);
      const fetchedColaboradores = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setColaboradores(fetchedColaboradores);
    } catch (error) {
      console.error("Erro ao buscar colaboradores:", error);
    }
  };

  useEffect(() => {
    fetchColaboradores();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredColaboradores = colaboradores.filter(colaborador =>
    colaborador.nome.toLowerCase().includes(searchTerm) ||
    colaborador.projeto.toLowerCase().includes(searchTerm)
  );

  const handleLimparFiltros = () => {
    setSearchTerm('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNovoColaborador(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'colaboradores'), novoColaborador);
      setShowModal(false);
      fetchColaboradores();
      setNovoColaborador({ nome: '', projeto: '', cargo: '', supervisor: '' });
    } catch (error) {
      console.error("Erro ao adicionar colaborador:", error);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Colaboradores</h1>
        
        <div className="mb-4 space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Buscar por nome ou projeto"
              value={searchTerm}
              onChange={handleSearchChange}
              className="border rounded px-2 py-1 flex-grow"
            />
            <button
              onClick={handleLimparFiltros}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Limpar Filtros
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Novo Colaborador
            </button>
          </div>
        </div>

        {/* Tabela de colaboradores */}
        <table className="min-w-full bg-white">
          <thead className="bg-[#10B981] text-white">
            <tr>
              <th className="py-2 px-4 border-b text-left">Nome</th>
              <th className="py-2 px-4 border-b text-left">Projeto</th>
              <th className="py-2 px-4 border-b text-left">Cargo</th>
              <th className="py-2 px-4 border-b text-left">Supervisor</th>
            </tr>
          </thead>
          <tbody>
            {filteredColaboradores.map((colaborador) => (
              <tr key={colaborador.id}>
                <td className="py-2 px-4 border-b">{colaborador.nome}</td>
                <td className="py-2 px-4 border-b">{colaborador.projeto}</td>
                <td className="py-2 px-4 border-b">{colaborador.cargo}</td>
                <td className="py-2 px-4 border-b">{colaborador.supervisor}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal para adicionar novo colaborador */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold mb-4">Adicionar Novo Colaborador</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    name="nome"
                    value={novoColaborador.nome}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Projeto</label>
                  <input
                    type="text"
                    name="projeto"
                    value={novoColaborador.projeto}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Cargo</label>
                  <select
                    name="cargo"
                    value={novoColaborador.cargo}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  >
                    <option value="">Selecione um cargo</option>
                    <option value="Assistente">Assistente</option>
                    <option value="Qualidade">Qualidade</option>
                    <option value="Supervisor">Supervisor</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Supervisor</label>
                  <input
                    type="text"
                    name="supervisor"
                    value={novoColaborador.supervisor}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
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
                    Salvar
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