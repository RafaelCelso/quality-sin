import React, { useState, useEffect } from 'react';
import { auth, db, collection, query, where, getDocs, orderBy, limit } from '../firebase';
import Sidebar from './Sidebar';
import { Phone, Mail, MessageSquare } from 'lucide-react';

const AssistenteDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [monitorias, setMonitorias] = useState<any[]>([]);
  const [resultado, setResultado] = useState(0);
  const [resultadoPercentual, setResultadoPercentual] = useState(0);
  const [projetoAtual, setProjetoAtual] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserData(currentUser.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid: string) => {
    try {
      const userDoc = await getDocs(query(collection(db, 'usuarios'), where('uid', '==', uid)));
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        setProjetoAtual(userData.projeto || 'Não definido');
        fetchMonitorias(uid);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      setError('Erro ao carregar dados do usuário. Por favor, tente novamente.');
      setLoading(false);
    }
  };

  const fetchMonitorias = async (uid: string) => {
    try {
      const monitoriasQuery = query(
        collection(db, 'monitorias'),
        where('colaboradorId', '==', uid),
        orderBy('dataCriacao', 'desc'),
        limit(10)
      );
      const querySnapshot = await getDocs(monitoriasQuery);
      const monitoriasData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMonitorias(monitoriasData);

      // Calcular resultado e percentual
      const totalNotas = monitoriasData.reduce((sum, monitoria) => sum + monitoria.notaMedia, 0);
      const mediaGeral = monitoriasData.length > 0 ? totalNotas / monitoriasData.length : 0;
      setResultado(mediaGeral);
      setResultadoPercentual((mediaGeral / 5) * 100); // Assumindo que a nota máxima é 5
    } catch (error: any) {
      console.error('Erro ao buscar monitorias:', error);
      setError('Erro ao carregar monitorias. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Seja bem-vindo, {user?.displayName} 👋</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Resultado</h2>
            <p className="text-3xl font-bold">{resultado.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Resultado %</h2>
            <p className="text-3xl font-bold">{resultadoPercentual.toFixed(2)}%</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Projeto atual</h2>
            <p className="text-3xl font-bold">{projetoAtual}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Minhas monitorias</h2>
          {monitorias.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">ID</th>
                  <th className="text-left">Tipo</th>
                  <th className="text-left">Pontuação</th>
                  <th className="text-left">Avaliador</th>
                  <th className="text-left">Data</th>
                  <th className="text-left">Projeto</th>
                </tr>
              </thead>
              <tbody>
                {monitorias.map((monitoria) => (
                  <tr key={monitoria.id}>
                    <td>{monitoria.id}</td>
                    <td>{monitoria.tipo}</td>
                    <td>{monitoria.notaMedia.toFixed(2)}</td>
                    <td>{monitoria.avaliadorNome}</td>
                    <td>{new Date(monitoria.dataCriacao.seconds * 1000).toLocaleDateString()}</td>
                    <td>{monitoria.projeto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Nenhuma monitoria encontrada.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssistenteDashboard;