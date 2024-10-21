import React, { useState, useEffect } from 'react';
import { Home, PhoneCall, Mail, MessageSquare } from 'lucide-react';
import Sidebar from './Sidebar';
import { auth, db, collection, query, where, getDocs, onSnapshot } from '../firebase';
import usePermissions from '../hooks/usePermissions';

const Dashboard: React.FC = () => {
  const [goals, setGoals] = useState({
    call: 30,
    email: 30,
    chat: 30
  });

  const [progress, setProgress] = useState({
    call: 0,
    email: 0,
    chat: 0
  });

  const [totalGoal, setTotalGoal] = useState(0);
  const [totalProgress, setTotalProgress] = useState(0);
  const { checkPermission } = usePermissions();
  const [userPermission, setUserPermission] = useState('');

  useEffect(() => {
    const fetchUserPermission = async () => {
      const user = auth.currentUser;
      if (user) {
        const userQuery = query(collection(db, 'usuarios'), where('uid', '==', user.uid));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setUserPermission(userData.permissao);
        }
      }
    };

    fetchUserPermission();
  }, []);

  useEffect(() => {
    const newTotalGoal = Object.values(goals).reduce((sum, value) => sum + value, 0);
    setTotalGoal(newTotalGoal);
  }, [goals]);

  useEffect(() => {
    if (!userPermission) return;

    const monitoriaQuery = query(collection(db, 'monitorias'));

    const unsubscribe = onSnapshot(monitoriaQuery, (snapshot) => {
      const monitorias = snapshot.docs.map(doc => doc.data());
      
      const filteredMonitorias = monitorias.filter(monitoria => {
        if (userPermission === 'Admin') return true;
        if (userPermission === 'Qualidade') return monitoria.avaliadorId === auth.currentUser?.uid;
        if (userPermission === 'Supervisor') return monitoria.supervisorId === auth.currentUser?.uid;
        return false;
      });

      const newProgress = {
        call: 0,
        email: 0,
        chat: 0
      };

      filteredMonitorias.forEach(monitoria => {
        if (monitoria.tipo === 'Ligação') newProgress.call++;
        if (monitoria.tipo === 'E-mail') newProgress.email++;
        if (monitoria.tipo === 'Chat') newProgress.chat++;
      });

      setProgress(newProgress);

      const totalCompleted = Object.values(newProgress).reduce((sum, value) => sum + value, 0);
      const totalGoalValue = Object.values(goals).reduce((sum, value) => sum + value, 0);
      const newTotalProgress = totalGoalValue > 0 ? (totalCompleted / totalGoalValue) * 100 : 0;
      setTotalProgress(newTotalProgress);
    });

    return () => unsubscribe();
  }, [userPermission, goals]);

  const handleGoalChange = (type: keyof typeof goals, value: number) => {
    setGoals(prev => ({ ...prev, [type]: value }));
  };

  const renderCard = (title: string, icon: React.ReactNode, type: keyof typeof goals) => (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center mb-2">
        <div className="bg-emerald-500 rounded-full p-2 mr-2">
          {icon}
        </div>
        <h3 className="text-lg font-semibold">Monitorias {title}</h3>
      </div>
      <div className="flex items-center mb-2">
        <span className="mr-2">Progresso</span>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${(progress[type] / goals[type]) * 100}%` }}></div>
        </div>
        <span className="ml-2">{progress[type]} / {goals[type]}</span>
      </div>
      <div className="flex items-center">
        <input
          type="number"
          placeholder="Meta..."
          className="border rounded px-2 py-1 w-full"
          value={goals[type]}
          onChange={(e) => handleGoalChange(type, Number(e.target.value))}
        />
      </div>
    </div>
  );

  const renderTotalCard = () => (
    <div className="bg-white rounded-lg shadow-md p-4 col-span-full">
      <div className="flex items-center mb-2">
        <div className="bg-emerald-500 rounded-full p-2 mr-2">
          <Home className="text-white" size={20} />
        </div>
        <h3 className="text-lg font-semibold">Monitorias Totais</h3>
      </div>
      <div className="flex items-center mb-2">
        <span className="mr-2">Progresso</span>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${totalProgress}%` }}></div>
        </div>
        <span className="ml-2">{totalProgress.toFixed(1)}%</span>
      </div>
      <div className="text-center font-semibold">
        Meta Total: {totalGoal}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="text-gray-600 mb-6">Resumo das atividades</p>
        
        <div className="grid grid-cols-1 gap-4">
          {renderTotalCard()}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderCard('Ligação', <PhoneCall className="text-white" size={20} />, 'call')}
            {renderCard('E-mail', <Mail className="text-white" size={20} />, 'email')}
            {renderCard('Chat', <MessageSquare className="text-white" size={20} />, 'chat')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
