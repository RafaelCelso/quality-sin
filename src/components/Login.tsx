import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db, collection, query, where, getDocs } from '../firebase';
import { Eye, EyeOff } from 'lucide-react';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    let retries = 3;
    while (retries > 0) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userQuery = query(collection(db, 'usuarios'), where('uid', '==', user.uid));
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          const permissao = userData.permissao;
          const cargo = userData.cargo;

          localStorage.setItem('userPermissao', permissao);
          localStorage.setItem('userCargo', cargo);

          if (permissao === 'Assistente') {
            navigate('/monitorias');
          } else {
            navigate('/dashboard');
          }
        } else {
          console.error('Usuário não encontrado no Firestore');
          navigate('/dashboard');
        }
        break; // Sai do loop se o login for bem-sucedido
      } catch (error: any) {
        if (error.code === 'resource-exhausted' && retries > 1) {
          retries--;
          await delay(2000); // Espera 2 segundos antes de tentar novamente
        } else {
          console.error('Erro ao fazer login:', error);
          setMessage('Erro ao fazer login. Verifique suas credenciais e tente novamente.');
          break;
        }
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage('Por favor, insira seu e-mail para redefinir a senha.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Um e-mail de redefinição de senha foi enviado. Verifique sua caixa de entrada.');
    } catch (error) {
      console.error('Erro ao enviar e-mail de redefinição de senha:', error);
      setMessage('Erro ao enviar e-mail de redefinição de senha. Tente novamente.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <img src="./sin-logo.png" alt="SIN Solution Logo" className="mx-auto mb-8 w-32" />
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          {message && (
            <div className="mb-4 p-2 rounded bg-red-100 text-red-700">
              {message}
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-6 relative">
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <div className="flex items-center justify-between">
              <button
                className="bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="inline-block align-baseline font-bold text-sm text-emerald-500 hover:text-emerald-800"
              >
                Esqueceu a senha?
              </button>
            </div>
          </form>
          <div className="mt-4 text-center">
            <Link to="/signup" className="font-bold text-sm text-emerald-500 hover:text-emerald-800">
              Criar uma conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;