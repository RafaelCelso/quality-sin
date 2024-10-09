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
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Monitorias</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Nova Monitoria
            </button>
          </div>
          
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por colaborador ou tipo"
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Colaborador</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nota Média</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMonitorias.map((monitoria) => (
                  <tr key={monitoria.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{monitoria.colaboradorNome}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        monitoria.tipo === 'Ligação' ? 'bg-blue-100 text-blue-800' :
                        monitoria.tipo === 'E-mail' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {monitoria.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(monitoria.dataCriacao.seconds * 1000).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        monitoria.notaMedia >= 90 ? 'bg-green-100 text-green-800' :
                        monitoria.notaMedia >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {monitoria.notaMedia.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(monitoria)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(monitoria)}
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
              <h2 className="text-2xl font-bold mb-4">Nova Monitoria</h2>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar colaborador"
                  value={colaboradorSearch}
                  onChange={(e) => setColaboradorSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {colaboradorSearch.length > 0 && (
                  <ul className="mt-2 max-h-40 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-sm">
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
                <h3 className="text-lg font-medium mb-2">Tipo de Monitoria</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTipoMonitoria('Ligação')}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg ${
                      tipoMonitoria === 'Ligação' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700'
                    } transition-colors duration-200`}
                  >
                    <Phone size={24} className="mb-2" />
                    Ligação
                  </button>
                  <button
                    onClick={() => setTipoMonitoria('E-mail')}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg ${
                      tipoMonitoria === 'E-mail' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700'
                    } transition-colors duration-200`}
                  >
                    <Mail size={24} className="mb-2" />
                    E-mail
                  </button>
                  <button
                    onClick={() => setTipoMonitoria('Chat')}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg ${
                      tipoMonitoria === 'Chat' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700'
                    } transition-colors duration-200`}
                  >
                    <MessageSquare size={24} className="mb-2" />
                    Chat
                  </button>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleNovaMonitoria}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors duration-200"
                  disabled={!selectedColaborador || !tipoMonitoria}
                >
                  Iniciar Monitoria
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-center mb-4">Excluir Monitoria</h3>
              <p className="text-center mb-6">
                Tem certeza que deseja excluir esta monitoria? Esta ação não pode ser desfeita.
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

export default Monitorias;