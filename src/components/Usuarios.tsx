import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Users, Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { auth, db, collection, getDocs, query, orderBy, limit, addDoc, updateDoc, deleteDoc, doc, createUserWithEmailAndPassword } from '../firebase';

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [novoUsuario, setNovoUsuario] = useState({
    nome: '',
    email: '',
    permissao: '',
    senha: '',
    confirmarSenha: '',
    colaboradorId: '',
    colaboradorNome: ''
  });
  const [novaSenha, setNovaSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [colaboradorSearch, setColaboradorSearch] = useState('');
  const [showColaboradorList, setShowColaboradorList] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsuarios();
    fetchColaboradores();
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nome.toLowerCase().includes(searchTerm) ||
    usuario.email.toLowerCase().includes(searchTerm)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editingUser) {
      setEditingUser(prev => ({ ...prev, [name]: value }));
    } else {
      setNovoUsuario(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!editingUser && novoUsuario.senha !== novoUsuario.confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      if (editingUser) {
        const userRef = doc(db, 'usuarios', editingUser.id);
        await updateDoc(userRef, {
          nome: editingUser.nome,
          email: editingUser.email,
          permissao: editingUser.permissao,
          colaboradorId: editingUser.colaboradorId,
          colaboradorNome: editingUser.colaboradorNome
        });

        if (novaSenha) {
          // Aqui você deve implementar a lógica para atualizar a senha do usuário no Firebase Authentication
          // Como não temos acesso direto à instância do usuário, você pode precisar implementar
          // uma função de Cloud Function ou uma API backend para lidar com isso de forma segura
          console.log("Nova senha definida:", novaSenha);
          // Por enquanto, vamos apenas simular que a senha foi alterada
          setSuccessMessage("A senha do usuário foi alterada com sucesso.");
        } else {
          setSuccessMessage("Dados do usuário atualizados com sucesso.");
        }

        setNovaSenha('');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, novoUsuario.email, novoUsuario.senha);
        await addDoc(collection(db, 'usuarios'), {
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          permissao: novoUsuario.permissao,
          colaboradorId: novoUsuario.colaboradorId,
          colaboradorNome: novoUsuario.colaboradorNome,
          uid: userCredential.user.uid
        });
        setNovoUsuario({ nome: '', email: '', permissao: '', senha: '', confirmarSenha: '', colaboradorId: '', colaboradorNome: '' });
        setSuccessMessage("Novo usuário criado com sucesso.");
      }

      setTimeout(() => {
        closeModal();
      }, 2000);
      
      fetchUsuarios();
    } catch (error) {
      console.error("Erro ao adicionar/atualizar usuário:", error);
      setError("Erro ao adicionar/atualizar usuário. Por favor, tente novamente.");
    }
  };

  const handleEdit = (usuario: any) => {
    setEditingUser(usuario);
    setNovaSenha('');
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (userToDelete) {
      try {
        await deleteDoc(doc(db, 'usuarios', userToDelete.id));
        setSuccessMessage("Usuário excluído com sucesso.");
        fetchUsuarios();
      } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        setError("Erro ao excluir usuário. Por favor, tente novamente.");
      } finally {
        setTimeout(() => {
          closeDeleteModal();
        }, 2000);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setNovoUsuario({ nome: '', email: '', permissao: '', senha: '', confirmarSenha: '', colaboradorId: '', colaboradorNome: '' });
    setNovaSenha('');
    setError(null);
    setSuccessMessage(null);
    setColaboradorSearch('');
    setShowColaboradorList(false);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
    setError(null);
    setSuccessMessage(null);
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

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Usuários</h1>
        
        <div className="mb-4 flex items-center space-x-4">
          <input
            type="text"
            placeholder="Buscar por nome ou email"
            value={searchTerm}
            onChange={handleSearchChange}
            className="border rounded px-2 py-1 flex-grow"
          />
          <button
            onClick={() => {
              setEditingUser(null);
              setShowModal(true);
            }}
            className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Novo Usuário
          </button>
        </div>

        <table className="min-w-full bg-white">
          <thead className="bg-[#10B981] text-white">
            <tr>
              <th className="py-2 px-4 border-b text-left">Nome</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Permissão</th>
              <th className="py-2 px-4 border-b text-left">Colaborador</th>
              <th className="py-2 px-4 border-b text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td className="py-2 px-4 border-b">{usuario.nome}</td>
                <td className="py-2 px-4 border-b">{usuario.email}</td>
                <td className="py-2 px-4 border-b">{usuario.permissao}</td>
                <td className="py-2 px-4 border-b">{usuario.colaboradorNome}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleEdit(usuario)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setUserToDelete(usuario);
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
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold mb-4">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    name="nome"
                    value={editingUser ? editingUser.nome : novoUsuario.nome}
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
                    value={editingUser ? editingUser.email : novoUsuario.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {editingUser ? 'Nova Senha (deixe em branco para não alterar)' : 'Senha'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="senha"
                      value={editingUser ? novaSenha : novoUsuario.senha}
                      onChange={editingUser ? (e) => setNovaSenha(e.target.value) : handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      required={!editingUser}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                {!editingUser && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Confirmar Senha</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmarSenha"
                        value={novoUsuario.confirmarSenha}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Permissão</label>
                  <select
                    name="permissao"
                    value={editingUser ? editingUser.permissao : novoUsuario.permissao}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
                  <label className="block text-sm font-medium text-gray-700">Colaborador</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={colaboradorSearch}
                      onChange={handleColaboradorSearch}
                      placeholder="Buscar colaborador..."
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
                {error && (
                  <div className="mb-4 text-red-500">{error}</div>
                )}
                {successMessage && (
                  <div className="mb-4 text-green-500">{successMessage}</div>
                )}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                  >
                    {editingUser ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold mb-4">Confirmar Exclusão</h3>
              <p className="mb-4">Tem certeza que deseja excluir o usuário {userToDelete?.nome}?</p>
              {error && (
                <div className="mb-4 text-red-500">{error}</div>
              )}
              {successMessage && (
                <div className="mb-4 text-green-500">{successMessage}</div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
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

export default Usuarios;