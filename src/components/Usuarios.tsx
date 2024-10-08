import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Users, Plus, Search, Edit, Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { auth, db, collection, getDocs, query, orderBy, limit, addDoc, updateDoc, deleteDoc, doc, createUserWithEmailAndPassword } from '../firebase';

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [cargos, setCargos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [novoUsuario, setNovoUsuario] = useState({
    nome: '',
    email: '',
    permissao: '',
    cargo: '',
    colaboradorId: '',
    colaboradorNome: '',
    senha: '',
    confirmarSenha: ''
  });
  const [colaboradorSearch, setColaboradorSearch] = useState('');
  const [showColaboradorList, setShowColaboradorList] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsuarios();
    fetchColaboradores();
    fetchCargos();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const q = query(collection(db, 'usuarios'), orderBy('nome'), limit(100));
      const querySnapshot = await getDocs(q);
      const fetchedUsuarios = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsuarios(fetchedUsuarios);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
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

  const fetchCargos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'cargos'));
      const fetchedCargos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCargos(fetchedCargos);
    } catch (error) {
      console.error("Erro ao buscar cargos:", error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editingUser) {
      setEditingUser(prev => ({ ...prev, [name]: value }));
    } else {
      setNovoUsuario(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleColaboradorSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColaboradorSearch(e.target.value);
    setShowColaboradorList(true);
  };

  const handleColaboradorSelect = (colaborador: any) => {
    if (editingUser) {
      setEditingUser(prev => ({
        ...prev,
        colaboradorId: colaborador.id,
        colaboradorNome: colaborador.nome
      }));
    } else {
      setNovoUsuario(prev => ({
        ...prev,
        colaboradorId: colaborador.id,
        colaboradorNome: colaborador.nome
      }));
    }
    setColaboradorSearch(colaborador.nome);
    setShowColaboradorList(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateDoc(doc(db, 'usuarios', editingUser.id), editingUser);
      } else {
        if (novoUsuario.senha !== novoUsuario.confirmarSenha) {
          alert("As senhas não coincidem!");
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, novoUsuario.email, novoUsuario.senha);
        const user = userCredential.user;
        await addDoc(collection(db, 'usuarios'), {
          ...novoUsuario,
          uid: user.uid,
          senha: null // Não armazenamos a senha no Firestore
        });
      }
      setShowModal(false);
      fetchUsuarios();
      setEditingUser(null);
      setNovoUsuario({
        nome: '',
        email: '',
        permissao: '',
        cargo: '',
        colaboradorId: '',
        colaboradorNome: '',
        senha: '',
        confirmarSenha: ''
      });
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
    }
  };

  const handleEdit = (usuario: any) => {
    setEditingUser(usuario);
    setShowModal(true);
  };

  const handleDeleteClick = (usuario: any) => {
    setUserToDelete(usuario);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (userToDelete) {
      try {
        await deleteDoc(doc(db, 'usuarios', userToDelete.id));
        fetchUsuarios();
        setShowDeleteModal(false);
      } catch (error) {
        console.error("Erro ao excluir usuário:", error);
      }
    }
  };

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nome.toLowerCase().includes(searchTerm) ||
    usuario.email.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Usuários</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Novo Usuário
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissão</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Colaborador</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{usuario.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{usuario.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        usuario.permissao === 'Admin' ? 'bg-red-100 text-red-800' :
                        usuario.permissao === 'Qualidade' ? 'bg-blue-100 text-blue-800' :
                        usuario.permissao === 'Supervisor' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {usuario.permissao}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{usuario.cargo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{usuario.colaboradorNome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(usuario)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(usuario)}
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
              <h2 className="text-2xl font-bold mb-4">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    name="nome"
                    value={editingUser ? editingUser.nome : novoUsuario.nome}
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
                    value={editingUser ? editingUser.email : novoUsuario.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                {!editingUser && (
                  <>
                    <div className="mb-4 relative">
                      <label className="block text-sm font-medium text-gray-700">Senha</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="senha"
                        value={novoUsuario.senha}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <div className="mb-4 relative">
                      <label className="block text-sm font-medium text-gray-700">Confirmar Senha</label>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmarSenha"
                        value={novoUsuario.confirmarSenha}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </>
                )}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Permissão</label>
                  <select
                    name="permissao"
                    value={editingUser ? editingUser.permissao : novoUsuario.permissao}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                    required
                  >
                    <option value="">Selecione uma permissão</option>
                    <option value="Admin">Admin</option>
                    <option value="Assistente">Assistente</option>
                    <option value="Qualidade">Qualidade</option>
                    <option value="Supervisor">Supervisor</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Cargo</label>
                  <select
                    name="cargo"
                    value={editingUser ? editingUser.cargo : novoUsuario.cargo}
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
                  <label className="block text-sm font-medium text-gray-700">Colaborador</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={colaboradorSearch}
                      onChange={handleColaboradorSearch}
                      placeholder="Buscar colaborador..."
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                    />
                    {showColaboradorList && (
                      <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                        {colaboradores
                          .filter(colaborador => 
                            colaborador.nome.toLowerCase().includes(colaboradorSearch.toLowerCase())
                          )
                          .map((colaborador) => (
                            <li
                              key={colaborador.id}
                              onClick={() => handleColaboradorSelect(colaborador)}
                              className="cursor-pointer hover:bg-gray-100 p-2"
                            >
                              {colaborador.nome}
                            </li>
                          ))
                        }
                      </ul>
                    )}
                  </div>
                  {(editingUser ? editingUser.colaboradorNome : novoUsuario.colaboradorNome) && (
                    <p className="mt-1 text-sm text-gray-500">
                      Colaborador selecionado: {editingUser ? editingUser.colaboradorNome : novoUsuario.colaboradorNome}
                    </p>
                  )}
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
                    {editingUser ? 'Atualizar' : 'Salvar'}
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
              <h3 className="text-lg font-bold text-center mb-4">Excluir Usuário</h3>
              <p className="text-center mb-6">
                Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
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

export default Usuarios;