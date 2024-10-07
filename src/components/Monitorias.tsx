import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { db, collection, getDocs, query, orderBy, limit, deleteDoc, doc } from '../firebase';
import { Plus, Search, Phone, Mail, MessageSquare, Edit, Trash2, AlertTriangle } from 'lucide-react';

const Monitorias: React.FC = () => {
  const [monitorias, setMonitorias] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [monitoriaToDelete, setMonitoriaToDelete] = useState<any>(null);
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [colaboradorSearch, setColaboradorSearch] = useState('');
  const [selectedColaborador, setSelectedColaborador] = useState<any>(null);
  const [tipoMonitoria, setTipoMonitoria] = useState('');
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredMonitorias = monitorias.filter(monitoria =>
    monitoria.colaboradorNome.toLowerCase().includes(searchTerm) ||
    monitoria.tipo.toLowerCase().includes(searchTerm)
  );

  const handleDeleteClick = (monitoria: any) => {
    setMonitoriaToDelete(monitoria);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (monitoriaToDelete) {
      try {
        await deleteDoc(doc(db, 'monitorias', monitoriaToDelete.id));
        fetchMonitorias();
        setShowDeleteModal(false);
      } catch (error) {
        console.error("Erro ao excluir monitoria:", error);
      }
    }
  };

  const handleNovaMonitoria = () => {
    if (selectedColaborador && tipoMonitoria) {
      let route = '';
      switch (tipoMonitoria) {
        case 'Ligação':
          route = '/monitoria-ligacao';
          break;
        case 'E-mail':
          route = '/monitoria-email';
          break;
        case 'Chat':
          route = '/monitoria-chat';
          break;
        default:
          console.error("Tipo de monitoria inválido");
          return;
      }
      navigate(route, { state: { colaborador: selectedColaborador, tipoMonitoria } });
      setShowModal(false);
    }
  };

  const handleEditClick = (monitoria: any) => {
    let route = '';
    switch (monitoria.tipo) {
      case 'Ligação':
        route = '/monitoria-ligacao';
        break;
      case 'E-mail':
        route = '/monitoria-email';
        break;
      case 'Chat':
        route = '/monitoria-chat';
        break;
      default:
        console.error("Tipo de monitoria inválido");
        return;
    }
    navigate(route, { state: { monitoria, isEditing: true } });
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Monitorias</h1>
        
        <div className="mb-4 flex items-center space-x-4">
          <input
            type="text"
            placeholder="Buscar por colaborador ou tipo"
            value={searchTerm}
            onChange={handleSearchChange}
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
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Colaborador</th>
              <th className="py-2 px-4 border-b text-left">Tipo</th>
              <th className="py-2 px-4 border-b text-left">Data</th>
              <th className="py-2 px-4 border-b text-left">Nota Média</th>
              <th className="py-2 px-4 border-b text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredMonitorias.map((monitoria) => (
              <tr key={monitoria.id}>
                <td className="py-2 px-4 border-b">{monitoria.colaboradorNome}</td>
                <td className="py-2 px-4 border-b">{monitoria.tipo}</td>
                <td className="py-2 px-4 border-b">{new Date(monitoria.dataCriacao.seconds * 1000).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b">{monitoria.notaMedia.toFixed(2)}%</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleEditClick(monitoria)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(monitoria)}
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
                  onChange={(e) => setColaboradorSearch(e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                />
                {colaboradorSearch.length > 0 && (
                  <ul className="mt-2 max-h-40 overflow-y-auto">
                    {colaboradores
                      .filter(colaborador => 
                        colaborador.nome.toLowerCase().includes(colaboradorSearch.toLowerCase())
                      )
                      .map((colaborador) => (
                        <li
                          key={colaborador.id}
                          onClick={() => {
                            setSelectedColaborador(colaborador);
                            setColaboradorSearch(colaborador.nome);
                          }}
                          className="cursor-pointer hover:bg-gray-100 p-2"
                        >
                          {colaborador.nome}
                        </li>
                      ))
                    }
                  </ul>
                )}
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Tipo de Monitoria</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setTipoMonitoria('Ligação')}
                    className={`flex-1 py-2 px-4 rounded ${
                      tipoMonitoria === 'Ligação' ? 'bg-emerald-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    <Phone size={24} className="mx-auto mb-1" />
                    Ligação
                  </button>
                  <button
                    onClick={() => setTipoMonitoria('E-mail')}
                    className={`flex-1 py-2 px-4 rounded ${
                      tipoMonitoria === 'E-mail' ? 'bg-emerald-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    <Mail size={24} className="mx-auto mb-1" />
                    E-mail
                  </button>
                  <button
                    onClick={() => setTipoMonitoria('Chat')}
                    className={`flex-1 py-2 px-4 rounded ${
                      tipoMonitoria === 'Chat' ? 'bg-emerald-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    <MessageSquare size={24} className="mx-auto mb-1" />
                    Chat
                  </button>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleNovaMonitoria}
                  className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                  disabled={!selectedColaborador || !tipoMonitoria}
                >
                  Iniciar Monitoria
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Excluir Monitoria</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Tem certeza que deseja excluir esta monitoria? Esta ação não pode ser desfeita.
                  </p>
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md mr-2 hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Monitorias;