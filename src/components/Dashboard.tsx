import React, { useState, useEffect } from 'react';
import { Home, PhoneCall, Mail, MessageSquare } from 'lucide-react';
import Sidebar from './Sidebar';

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

  useEffect(() => {
    const newTotalGoal = Object.values(goals).reduce((sum, value) => sum + value, 0);
    setTotalGoal(newTotalGoal);
    
    const newTotalProgress = Object.values(progress).reduce((sum, value) => sum + value, 0) / 3;
    setTotalProgress(newTotalProgress);
  }, [goals, progress]);

  const handleGoalChange = (type: keyof typeof goals, value: number) => {
    setGoals(prev => ({ ...prev, [type]: value }));
  };

  const updateProgress = (type: keyof typeof progress, value: number) => {
    setProgress(prev => ({ ...prev, [type]: value }));
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
          <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${progress[type]}%` }}></div>
        </div>
        <span className="ml-2">{progress[type]}%</span>
      </div>
      <div className="flex items-center">
        <input
          type="number"
          placeholder="Meta..."
          className="border rounded px-2 py-1 mr-2 w-full"
          value={goals[type]}
          onChange={(e) => handleGoalChange(type, Number(e.target.value))}
        />
        <button className="bg-emerald-500 text-white px-2 py-1 rounded hover:bg-emerald-600 whitespace-nowrap">
          Salvar Meta
        </button>
      </div>
      <button 
        onClick={() => updateProgress(type, Math.min(progress[type] + 10, 100))}
        className="mt-2 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 w-full"
      >
        Simular Progresso
      </button>
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