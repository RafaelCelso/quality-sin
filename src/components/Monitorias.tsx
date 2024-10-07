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

  const handleEditMonitoria = (monitoria: any) => {
    if (monitoria.tipo === 'Ligação') {
      navigate('/monitoria-ligacao', { 
        state: { 
          monitoria: monitoria,
          isEditing: true
        } 
      });
    } else {
      // Implemente a lógica para editar outros tipos de monitoria aqui
      console.log("Editando monitoria:", monitoria);
    }
  };

  const handleDeleteMonitoria = async () => {
    if (monitoriaToDelete) {
      try {
        await deleteDoc(doc(db, 'monitorias', monitoriaToDelete.id));
        setMonitorias(monitorias.filter(m => m.id !== monitoriaToDelete.id));
        setShowDeleteModal(false);
        setMonitoriaToDelete(null);
      } catch (error) {
        console.error("Erro ao excluir monitoria:", error);
        setErrorMessage("Erro ao excluir monitoria. Por favor, tente novamente.");
      }
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Monitorias</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 mb-4"
        >
          <Plus size={20} className="inline mr-2" />
          Nova Monitoria
        </button>

        <table className="min-w-full bg-white">
          <thead className="bg-[#10B981] text-white">
            <tr>
              <th className="py-2 px-4 border-b text-left">Colaborador</th>
              <th className="py-2 px-4 border-b text-left">Tipo</th>
              <th className="py-2 px-4 border-b text-left">Data</th>
              <th className="py-2 px-4 border-b text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {monitorias.map((monitoria) => (
              <tr key={monitoria.id}>
                <td className="py-2 px-4 border-b">{monitoria.colaborador && monitoria.colaborador.nome ? monitoria.colaborador.nome : 'N/A'}</td>
                <td className="py-2 px-4 border-b">{monitoria.tipo || 'N/A'}</td>
                <td className="py-2 px-4 border-b">
                  {monitoria.dataCriacao ? new Date(monitoria.dataCriacao.seconds * 1000).toLocaleString() : 'N/A'}
                </td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleEditMonitoria(monitoria)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setMonitoriaToDelete(monitoria);
                      setShowDeleteModal(true);
                    }}
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
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="relative p-8 border w-full max-w-md shadow-lg rounded-md bg-white">
              <h3 className="text-2xl font-bold mb-6">Nova Monitoria</h3>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar colaborador"
                  value={colaboradorSearch}
                  onChange={handleColaboradorSearch}
                  className="w-full px-3 py-2 border rounded-md"
                />
                {filteredColaboradores.length > 0 && (
                  <ul className="mt-2 border rounded-md max-h-40 overflow-y-auto">
                    {filteredColaboradores.map(colaborador => (
                      <li
                        key={colaborador.id}
                        onClick={() => handleSelectColaborador(colaborador)}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {colaborador.nome}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mb-4">
                <h4 className="text-lg font-semibold mb-2">Tipo de Monitoria</h4>
                <div className="grid grid-cols-3 gap-4">
                  {['Ligação', 'E-mail', 'Chat'].map((tipo) => (
                    <button
                      key={tipo}
                      onClick={() => setTipoMonitoria(tipo)}
                      className={`p-4 border rounded-md flex flex-col items-center justify-center ${
                        tipoMonitoria === tipo ? 'bg-emerald-100 border-emerald-500' : ''
                      }`}
                    >
                      {tipo === 'Ligação' && <Phone size={24} />}
                      {tipo === 'E-mail' && <Mail size={24} />}
                      {tipo === 'Chat' && <MessageSquare size={24} />}
                      <span className="mt-2">{tipo}</span>
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
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md mr-4 hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateMonitoria}
                  className="bg-emerald-500 text-white px-6 py-2 rounded-md hover:bg-emerald-600 transition-colors"
                >
                  Criar Monitoria
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="relative p-8 border w-full max-w-md shadow-lg rounded-md bg-white">
              <h3 className="text-2xl font-bold mb-6">Confirmar Exclusão</h3>
              <p className="mb-4">Tem certeza que deseja excluir esta monitoria?</p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md mr-4 hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteMonitoria}
                  className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors"
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