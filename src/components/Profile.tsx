import React, { useState, useEffect } from 'react';
import { User, Mail, Lock } from 'lucide-react';
import Sidebar from './Sidebar';
import { auth, updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from '../firebase';

const Profile: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const user = auth.currentUser;

    if (!user) {
      setMessage('Usuário não autenticado');
      return;
    }

    try {
      // Reautenticar o usuário
      if (currentPassword) {
        const credential = EmailAuthProvider.credential(user.email!, currentPassword);
        await reauthenticateWithCredential(user, credential);
      }

      // Atualizar nome
      if (name !== user.displayName) {
        await updateProfile(user, { displayName: name });
      }

      // Atualizar email
      if (email !== user.email) {
        await updateEmail(user, email);
      }

      // Atualizar senha
      if (password) {
        await updatePassword(user, password);
      }

      setMessage('Perfil atualizado com sucesso!');
      setPassword('');
      setCurrentPassword('');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setMessage('Erro ao atualizar perfil. Verifique suas credenciais e tente novamente.');
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Editar Perfil</h1>
        {message && (
          <div className={`mb-4 p-2 rounded ${message.includes('sucesso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="max-w-md">
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="name"
                id="name"
                className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="email"
                name="email"
                id="email"
                className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Senha Atual</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="password"
                name="currentPassword"
                id="currentPassword"
                className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Senha atual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Nova Senha (deixe em branco para não alterar)</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="password"
                name="password"
                id="password"
                className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Nova senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Atualizar Perfil
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;