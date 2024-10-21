import React, { useState, useEffect } from 'react';
import { Home, PhoneCall, Mail, MessageSquare, BarChart2 } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Sidebar from './Sidebar';
import { auth, db, collection, query, where, getDocs, onSnapshot } from '../firebase';
import usePermissions from '../hooks/usePermissions';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

  const [averageResult, setAverageResult] = useState(0);
  const [resultsByType, setResultsByType] = useState({
    call: 0,
    email: 0,
    chat: 0
  });

  const [criteriosLigacao, setCriteriosLigacao] = useState({
    cordialidade: 0,
    linguagem: 0,
    efetividade: 0,
    personalizacao: 0
  });

  const [criteriosEmail, setCriteriosEmail] = useState({
    atencaoPerfil: 0,
    cordialidade: 0,
    linguagem: 0,
    tempoResposta: 0
  });

  const [criteriosChat, setCriteriosChat] = useState({
    cordialidadeEmpatia: 0,
    linguagemInformal: 0,
    sequenciaEfetividade: 0,
    tempoResposta: 0
  });

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

      let totalResult = 0;
      const resultsByType = {
        call: { sum: 0, count: 0 },
        email: { sum: 0, count: 0 },
        chat: { sum: 0, count: 0 }
      };

      const ligacaoCriterios = {
        cordialidade: [],
        linguagem: [],
        efetividade: [],
        personalizacao: []
      };

      const emailCriterios = {
        atencaoPerfil: [],
        cordialidade: [],
        linguagem: [],
        tempoResposta: []
      };

      const chatCriterios = {
        cordialidadeEmpatia: [],
        linguagemInformal: [],
        sequenciaEfetividade: [],
        tempoResposta: []
      };

      filteredMonitorias.forEach(monitoria => {
        if (monitoria.tipo === 'Ligação') {
          newProgress.call++;
          resultsByType.call.sum += monitoria.notaMedia;
          resultsByType.call.count++;

          // Acumular valores dos critérios de ligação
          if (monitoria.cordialidade && monitoria.cordialidade.nota) ligacaoCriterios.cordialidade.push(Number(monitoria.cordialidade.nota));
          if (monitoria.linguagem && monitoria.linguagem.nota) ligacaoCriterios.linguagem.push(Number(monitoria.linguagem.nota));
          if (monitoria.efetividade && monitoria.efetividade.nota) ligacaoCriterios.efetividade.push(Number(monitoria.efetividade.nota));
          if (monitoria.personalizacao && monitoria.personalizacao.nota) ligacaoCriterios.personalizacao.push(Number(monitoria.personalizacao.nota));
        }
        if (monitoria.tipo === 'E-mail') {
          newProgress.email++;
          resultsByType.email.sum += monitoria.notaMedia;
          resultsByType.email.count++;

          // Acumular valores dos critérios de e-mail
          if (monitoria.atencaoPerfil && monitoria.atencaoPerfil.nota) emailCriterios.atencaoPerfil.push(Number(monitoria.atencaoPerfil.nota));
          if (monitoria.cordialidade && monitoria.cordialidade.nota) emailCriterios.cordialidade.push(Number(monitoria.cordialidade.nota));
          if (monitoria.linguagem && monitoria.linguagem.nota) emailCriterios.linguagem.push(Number(monitoria.linguagem.nota));
          if (monitoria.tempoResposta && monitoria.tempoResposta.nota) emailCriterios.tempoResposta.push(Number(monitoria.tempoResposta.nota));
        }
        if (monitoria.tipo === 'Chat') {
          newProgress.chat++;
          resultsByType.chat.sum += monitoria.notaMedia;
          resultsByType.chat.count++;

          // Acumular valores dos critérios de chat
          if (monitoria.cordialidadeEmpatia && monitoria.cordialidadeEmpatia.nota) chatCriterios.cordialidadeEmpatia.push(Number(monitoria.cordialidadeEmpatia.nota));
          if (monitoria.linguagemInformal && monitoria.linguagemInformal.nota) chatCriterios.linguagemInformal.push(Number(monitoria.linguagemInformal.nota));
          if (monitoria.sequenciaEfetividade && monitoria.sequenciaEfetividade.nota) chatCriterios.sequenciaEfetividade.push(Number(monitoria.sequenciaEfetividade.nota));
          if (monitoria.tempoResposta && monitoria.tempoResposta.nota) chatCriterios.tempoResposta.push(Number(monitoria.tempoResposta.nota));
        }
        totalResult += monitoria.notaMedia;
      });

      setProgress(newProgress);

      const totalCompleted = Object.values(newProgress).reduce((sum, value) => sum + value, 0);
      const totalGoalValue = Object.values(goals).reduce((sum, value) => sum + value, 0);
      const newTotalProgress = totalGoalValue > 0 ? (totalCompleted / totalGoalValue) * 100 : 0;
      setTotalProgress(newTotalProgress);

      const newAverageResult = totalCompleted > 0 ? totalResult / totalCompleted : 0;
      setAverageResult(newAverageResult);

      setResultsByType({
        call: resultsByType.call.count > 0 ? resultsByType.call.sum / resultsByType.call.count : 0,
        email: resultsByType.email.count > 0 ? resultsByType.email.sum / resultsByType.email.count : 0,
        chat: resultsByType.chat.count > 0 ? resultsByType.chat.sum / resultsByType.chat.count : 0
      });

      // Calcular médias dos critérios
      setCriteriosLigacao({
        cordialidade: calcularMedia(ligacaoCriterios.cordialidade),
        linguagem: calcularMedia(ligacaoCriterios.linguagem),
        efetividade: calcularMedia(ligacaoCriterios.efetividade),
        personalizacao: calcularMedia(ligacaoCriterios.personalizacao)
      });

      setCriteriosEmail({
        atencaoPerfil: calcularMedia(emailCriterios.atencaoPerfil),
        cordialidade: calcularMedia(emailCriterios.cordialidade),
        linguagem: calcularMedia(emailCriterios.linguagem),
        tempoResposta: calcularMedia(emailCriterios.tempoResposta)
      });

      setCriteriosChat({
        cordialidadeEmpatia: calcularMedia(chatCriterios.cordialidadeEmpatia),
        linguagemInformal: calcularMedia(chatCriterios.linguagemInformal),
        sequenciaEfetividade: calcularMedia(chatCriterios.sequenciaEfetividade),
        tempoResposta: calcularMedia(chatCriterios.tempoResposta)
      });
    });

    return () => unsubscribe();
  }, [userPermission, goals]);

  const calcularMedia = (valores: number[]) => {
    return valores.length > 0 ? valores.reduce((sum, value) => sum + value, 0) / valores.length : 0;
  };

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
    <div className="bg-white rounded-lg shadow-md p-4">
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

  const getResultColor = (result: number) => {
    if (result >= 90) return 'bg-green-500 text-white';
    if (result >= 80) return 'bg-yellow-500 text-white';
    return 'bg-red-500 text-white';
  };

  const renderAverageResultCard = () => {
    const resultColor = getResultColor(averageResult);
    return (
      <div className={`rounded-lg shadow-md p-6 flex flex-col justify-center h-full ${resultColor}`}>
        <div className="flex items-center mb-4">
          <div className="bg-white rounded-full p-2 mr-3">
            <BarChart2 className={`${resultColor.includes('green') ? 'text-green-500' : resultColor.includes('yellow') ? 'text-yellow-500' : 'text-red-500'}`} size={24} />
          </div>
          <h3 className="text-xl font-semibold text-white">Média Geral dos Resultados</h3>
        </div>
        <div className="text-center flex-grow flex items-center justify-center">
          <span className="text-5xl font-bold">{averageResult.toFixed(2)}%</span>
        </div>
      </div>
    );
  };

  const renderResultsChart = () => {
    const data = {
      labels: ['Ligação', 'E-mail', 'Chat'],
      datasets: [
        {
          label: 'Média de Resultados por Tipo',
          data: [resultsByType.call, resultsByType.email, resultsByType.chat],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 206, 86, 0.6)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Resultados por Tipo de Monitoria',
        },
      },
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div style={{ height: '250px' }}>
          <Bar data={data} options={options} />
        </div>
      </div>
    );
  };

  const renderCriteriosChart = (tipo: string, criterios: { [key: string]: number }) => {
    const data = {
      labels: Object.keys(criterios).map(key => key.charAt(0).toUpperCase() + key.slice(1)),
      datasets: [
        {
          label: `Média dos Critérios - ${tipo}`,
          data: Object.values(criterios),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: `Critérios - ${tipo}`,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 5,
          ticks: {
            stepSize: 1,
          },
        },
      },
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div style={{ height: '300px' }}>
          <Bar data={data} options={options} />
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="text-gray-600 mb-6">Resumo das atividades</p>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {renderTotalCard()}
            {renderCard('Ligação', <PhoneCall className="text-white" size={20} />, 'call')}
            {renderCard('E-mail', <Mail className="text-white" size={20} />, 'email')}
            {renderCard('Chat', <MessageSquare className="text-white" size={20} />, 'chat')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderAverageResultCard()}
            {renderResultsChart()}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderCriteriosChart('Ligação', criteriosLigacao)}
            {renderCriteriosChart('E-mail', criteriosEmail)}
            {renderCriteriosChart('Chat', criteriosChat)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
