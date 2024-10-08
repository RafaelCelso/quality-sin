import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from '../firebase';
import { Plus, Edit, Trash2 } from 'lucide-react';
import usePermissions from '../hooks/usePermissions';

const Cargos: React.FC = () => {
  const navigate = useNavigate();
  const { checkPermission, loading: permissionsLoading } = usePermissions();
  const [cargos, setCargos] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCargo, setEditingCargo] = useState<any>(null);
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

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este cargo?")) {
      try {
        await deleteDoc(doc(db, 'cargos', id));
        fetchCargos();
      } catch (error) {
        console.error("Erro ao excluir cargo:", error);
        setError("Erro ao excluir cargo. Por favor, tente novamente.");
      }
    }
  };

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
        <h1 className="text-2xl font-bold mb-4">Cargos</h1>
        
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 flex items-center mb-4"
        >
          <Plus size={20} className="mr-2" />
          Novo Cargo
        </button>

        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Nome</th>
              <th className="py-2 px-4 border-b text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {cargos.map((cargo) => (
              <tr key={cargo.id}>
                <td className="py-2 px-4 border-b">{cargo.nome}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleEdit(cargo)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(cargo.id)}
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
              <h3 className="text-lg font-bold mb-4">{editingCargo ? 'Editar Cargo' : 'Novo Cargo'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    name="nome"
                    value={editingCargo ? editingCargo.nome : novoCargo.nome}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    required
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
                    {editingCargo ? 'Atualizar' : 'Salvar'}
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

export default Cargos;