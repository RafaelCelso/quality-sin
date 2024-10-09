import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from '../firebase';
import { Plus, Edit, Trash2, AlertTriangle, X } from 'lucide-react';
import usePermissions from '../hooks/usePermissions';

const Cargos: React.FC = () => {
  const navigate = useNavigate();
  const { checkPermission, loading: permissionsLoading } = usePermissions();
  const [cargos, setCargos] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCargo, setEditingCargo] = useState<any>(null);
  const [cargoToDelete, setCargoToDelete] = useState<any>(null);
  const [novoCargo, setNovoCargo] = useState({ nome: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!permissionsLoading) {
      if (checkPermission('Visualizar Cargos')) {
        fetchCargos();
      } else {
        navigate('/');
      }
    }
  }, [checkPermission, navigate, permissionsLoading]);

  const fetchCargos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'cargos'));
      const fetchedCargos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCargos(fetchedCargos);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar cargos:", error);
      setError("Erro ao carregar cargos. Por favor, tente novamente.");
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingCargo) {
      setEditingCargo(prev => ({ ...prev, [name]: value }));
    } else {
      setNovoCargo(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCargo) {
        await updateDoc(doc(db, 'cargos', editingCargo.id), { nome: editingCargo.nome });
      } else {
        await addDoc(collection(db, 'cargos'), novoCargo);
      }
      setShowModal(false);
      fetchCargos();
      setEditingCargo(null);
      setNovoCargo({ nome: '' });
    } catch (error) {
      console.error("Erro ao salvar cargo:", error);
      setError("Erro ao salvar cargo. Por favor, tente novamente.");
    }
  };

  const handleEdit = (cargo: any) => {
    setEditingCargo(cargo);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (cargoToDelete) {
      try {
        await deleteDoc(doc(db, 'cargos', cargoToDelete.id));
        fetchCargos();
        setShowDeleteModal(false);
      } catch (error) {
        console.error("Erro ao excluir cargo:", error);
        setError("Erro ao excluir cargo. Por favor, tente novamente.");
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
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Cargos</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Novo Cargo
            </button>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cargos.map((cargo) => (
                  <tr key={cargo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{cargo.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(cargo)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => {
                          setCargoToDelete(cargo);
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
                <h2 className="text-2xl font-bold">{editingCargo ? 'Editar Cargo' : 'Novo Cargo'}</h2>
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
                    value={editingCargo ? editingCargo.nome : novoCargo.nome}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                    required
                  />
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
                    {editingCargo ? 'Atualizar' : 'Salvar'}
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
              <h3 className="text-lg font-bold text-center mb-4">Excluir Cargo</h3>
              <p className="text-center mb-6">
                Tem certeza que deseja excluir este cargo? Esta ação não pode ser desfeita.
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

export default Cargos;