import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { db, collection, getDocs, query, orderBy, limit, deleteDoc, doc } from '../firebase';
import { Plus, Search, Phone, Mail, MessageSquare, Edit, Trash2 } from 'lucide-react';

const Monitorias: React.FC = () => {
  const [monitorias, setMonitorias] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [monitoriaToDelete, setMonitoriaToDelete] = useState<any>(null);
  const [colaboradorSearch, setColaboradorSearch] = useState('');
  const [selectedColaborador, setSelectedColaborador] = useState<any>(null);
  const [tipoMonitoria, setTipoMonitoria] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [filteredColaboradores, setFilteredColaboradores] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMonitorias();
    fetchColaboradores();
  }, []);

  const fetchMonitorias = async () => {
    try {
      const q = query(collection(db, 'monitorias'), orderBy('dataCriacao', 'desc'), limit(100));
      const querySnapshot = await getDocs(q);
      const fetchedMonitorias = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMonitorias(fetchedMonitorias);
    } catch (error) {
      console.error("Erro ao buscar monitorias:", error);
    }
  };

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

  const handleColaboradorSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();
    setColaboradorSearch(searchTerm);
    const filtered = colaboradores.filter(colaborador =>
      colaborador.nome.toLowerCase().includes(searchTerm)
    );
    setFilteredColaboradores(filtered);
  };

  const handleSelectColaborador = (colaborador: any) => {
    setSelectedColaborador(colaborador);
    setColaboradorSearch(colaborador.nome);
    setFilteredColaboradores([]);
  };

  const handleCreateMonitoria = () => {
    if (!selectedColaborador || !tipoMonitoria) {
      setErrorMessage("Por favor, selecione um colaborador e um tipo de monitoria.");
      return;
    }
    
    if (tipoMonitoria === 'Ligação') {
      navigate('/monitoria-ligacao', { 
        state: { 
          colaborador: selectedColaborador,
          tipoMonitoria: tipoMonitoria
        } 
      });
    } else {
      // Implemente a lógica para outros tipos de monitoria aqui
      console.log("Criando monitoria para:", selectedColaborador.nome, "Tipo:", tipoMonitoria);
    }
    
    setShowModal(false);
    setSelectedColaborador(null);
    setTipoMonitoria('');
    setErrorMessage('');
    setColaboradorSearch('');
  };

  const handleEditMonitoria = (monitoria: any) => {
    if (monitoria.tipo === 'Ligação') {
      navigate('/monitoria-ligacao', { 
        state: { 
          monitoria: monitoria,
          isEditing: true,
          colaborador: { id: monitoria.colaboradorId, nome: monitoria.colaboradorNome }
        } 
      });
    } else {
      // Implemente a lógica para outros tipos de monitoria aqui
      console.log("Editando monitoria:", monitoria);
    }
  };

  const handleDeleteMonitoria = (monitoria: any) => {
    setMonitoriaToDelete(monitoria);
    setShowDeleteModal(true);
  };

  const confirmDeleteMonitoria = async () => {
    if (monitoriaToDelete) {
      try {
        await deleteDoc(doc(db, 'monitorias', monitoriaToDelete.id));
        setMonitorias(monitorias.filter(m => m.id !== monitoriaToDelete.id));
        setShowDeleteModal(false);
        setMonitoriaToDelete(null);
      } catch (error) {
        console.error("Erro ao excluir monitoria:", error);
      }
    }
  };

  const tiposMonitoria = [
    { tipo: 'Ligação', icon: <Phone size={32} /> },
    { tipo: 'E-mail', icon: <Mail size={32} /> },
    { tipo: 'Chat', icon: <MessageSquare size={32} /> },
  ];

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Monitorias</h1>
        
        <div className="mb-4 flex items-center space-x-4">
          <input
            type="text"
            placeholder="Buscar por colaborador"
            value={colaboradorSearch}
            onChange={handleColaboradorSearch}
            className="border rounded px-2 py-1 flex-grow"
          />
          <button
            onClick={() => setShowModal(true)}
            className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Nova Monitoria
          </button>
        </div>

        <table className="min-w-full bg-white">
          <thead className="bg-[#10B981] text-white">
            <tr>
              <th className="py-2 px-4 border-b text-left">Colaborador</th>
              <th className="py-2 px-4 border-b text-left">Tipo</th>
              <th className="py-2 px-4 border-b text-left">Data</th>
              <th className="py-2 px-4 border-b text-left">Nota</th>
              <th className="py-2 px-4 border-b text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {monitorias.map((monitoria) => (
              <tr key={monitoria.id}>
                <td className="py-2 px-4 border-b">{monitoria.colaboradorNome}</td>
                <td className="py-2 px-4 border-b">{monitoria.tipo}</td>
                <td className="py-2 px-4 border-b">
                  {new Date(monitoria.dataCriacao.seconds * 1000).toLocaleDateString()}
                </td>
                <td className="py-2 px-4 border-b">{monitoria.notaMedia}%</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleEditMonitoria(monitoria)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteMonitoria(monitoria)}
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
              <h3 className="text-lg font-bold mb-4">Nova Monitoria</h3>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar colaborador"
                  value={colaboradorSearch}
                  onChange={handleColaboradorSearch}
                  className="w-full border rounded px-2 py-1"
                />
                {filteredColaboradores.length > 0 && (
                  <ul className="mt-2 border rounded">
                    {filteredColaboradores.map((colaborador) => (
                      <li
                        key={colaborador.id}
                        onClick={() => handleSelectColaborador(colaborador)}
                        className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                      >
                        {colaborador.nome}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Monitoria</label>
                <div className="grid grid-cols-3 gap-2">
                  {tiposMonitoria.map((tipo) => (
                    <button
                      key={tipo.tipo}
                      onClick={() => setTipoMonitoria(tipo.tipo)}
                      className={`flex flex-col items-center justify-center p-3 border rounded-lg ${
                        tipoMonitoria === tipo.tipo ? 'bg-emerald-100 border-emerald-500' : 'bg-white'
                      } hover:bg-emerald-50 transition-colors duration-200`}
                    >
                      <div className="text-emerald-600 mb-2">{tipo.icon}</div>
                      <span className="text-sm font-medium">{tipo.tipo}</span>
                    </button>
                  ))}
                </div>
              </div>
              {errorMessage && (
                <p className="text-red-500 mb-4">{errorMessage}</p>
              )}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 mr-2"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateMonitoria}
                  className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                >
                  Criar Monitoria
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold mb-4">Confirmar Exclusão</h3>
              <p>Tem certeza que deseja excluir esta monitoria?</p>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 mr-2"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteMonitoria}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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

export default Monitorias;