import React, { useState, useEffect, useCallback } from 'react';
import { Home, PhoneCall, Mail, MessageSquare, BarChart2, Calendar, Target, Download } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Sidebar from './Sidebar';
import CircularProgressBar from './CircularProgressBar';
import { auth, db, collection, query, where, getDocs, onSnapshot, orderBy, getDoc, doc, updateDoc } from '../firebase';
import usePermissions from '../hooks/usePermissions';
import * as XLSX from 'xlsx';

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

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [tempGoals, setTempGoals] = useState({
    call: 30,
    email: 30,
    chat: 30
  });

  const [projects, setProjects] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('Todos');
  const [colaboradores, setColaboradores] = useState<{ id: string; nome: string }[]>([]);
  const [selectedColaborador, setSelectedColaborador] = useState<string>('Todos');

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

    // Adicione este novo efeito para buscar os projetos
    const fetchProjects = async () => {
      try {
        const projectsQuery = query(collection(db, 'projetos'), orderBy('nome'));
        const projectsSnapshot = await getDocs(projectsQuery);
        const projectsList = projectsSnapshot.docs.map(doc => doc.data().nome);
        setProjects(['Todos', ...projectsList]);
      } catch (error) {
        console.error("Erro ao buscar projetos:", error);
      }
    };

    fetchProjects();

    // Adicione esta chamada para carregar os dados iniciais
    loadDashboardData();
  }, []);

  useEffect(() => {
    fetchColaboradores();
  }, [selectedProject]);

  const fetchColaboradores = async () => {
    try {
      let colaboradoresQuery;
      if (selectedProject === 'Todos') {
        colaboradoresQuery = query(collection(db, 'colaboradores'));
      } else {
        colaboradoresQuery = query(collection(db, 'colaboradores'), where('projeto', '==', selectedProject));
      }
      const colaboradoresSnapshot = await getDocs(colaboradoresQuery);
      const colaboradoresList = colaboradoresSnapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome
      }));
      setColaboradores([{ id: 'Todos', nome: 'Todos' }, ...colaboradoresList]);
      setSelectedColaborador('Todos');
    } catch (error) {
      console.error("Erro ao buscar colaboradores:", error);
    }
  };

  // Função para carregar os dados do dashboard
  const loadDashboardData = useCallback(() => {
    if (!userPermission) return;

    const monitoriaQuery = query(collection(db, 'monitorias'));

    const unsubscribe = onSnapshot(monitoriaQuery, (snapshot) => {
      const monitorias = snapshot.docs.map(doc => doc.data());
      
      const filteredMonitorias = monitorias.filter(monitoria => {
        const monitoriaDate = new Date(monitoria.dataCriacao.seconds * 1000);
        const matchesDate = monitoriaDate.getMonth() === selectedMonth && monitoriaDate.getFullYear() === selectedYear;
        const matchesProject = selectedProject === 'Todos' || monitoria.projeto === selectedProject;
        const matchesColaborador = selectedColaborador === 'Todos' || monitoria.colaboradorId === selectedColaborador;
        return matchesDate && matchesProject && matchesColaborador;
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
  }, [userPermission, goals, selectedMonth, selectedYear, selectedProject, selectedColaborador]);

  // Atualizar o useEffect que depende das mudanças de filtro
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    const newTotalGoal = Object.values(goals).reduce((sum, value) => sum + value, 0);
    setTotalGoal(newTotalGoal);
  }, [goals]);

  const calcularMedia = (valores: number[]) => {
    return valores.length > 0 ? valores.reduce((sum, value) => sum + value, 0) / valores.length : 0;
  };

  const handleGoalChange = (type: keyof typeof goals, value: number) => {
    setGoals(prev => ({ ...prev, [type]: value }));
  };

  const handleMetaChange = (type: keyof typeof tempGoals, value: number) => {
    setTempGoals(prev => ({ ...prev, [type]: value }));
  };

  const handleSaveMetas = () => {
    setGoals(tempGoals);
    setShowMetaModal(false);
  };

  const renderCard = (title: string, icon: React.ReactNode, type: keyof typeof goals) => (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center mb-4">
        <div className="bg-emerald-500 rounded-full p-2 mr-2">
          {icon}
        </div>
        <h3 className="text-lg font-semibold">Monitorias {title}</h3>
      </div>
      <div className="flex flex-col items-center">
        <CircularProgressBar
          percentage={(progress[type] / goals[type]) * 100}
          size={100}
          strokeWidth={8}
          circleOneStroke="#e5e7eb"
          circleTwoStroke="#10b981"
        />
        <div className="mt-4 text-center">
          <span className="font-semibold text-lg">{progress[type]} / {goals[type]}</span>
        </div>
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
      <div className="flex flex-col items-center">
        <CircularProgressBar
          percentage={totalProgress}
          size={120}
          strokeWidth={10}
          circleOneStroke="#e5e7eb"
          circleTwoStroke="#10b981"
        />
        <div className="mt-2 text-center">
          <span className="font-semibold">Meta Total: {totalGoal}</span>
        </div>
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

  const renderDateAndProjectFilter = () => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center mb-2">
        <Calendar className="text-emerald-500 mr-2" size={20} />
        <h3 className="text-lg font-semibold">Filtros</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="w-full border rounded px-2 py-1"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full border rounded px-2 py-1"
          >
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i} value={new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Projeto</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            {projects.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Colaborador</label>
          <select
            value={selectedColaborador}
            onChange={(e) => setSelectedColaborador(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            {colaboradores.map((colaborador) => (
              <option key={colaborador.id} value={colaborador.id}>
                {colaborador.nome}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderMetaModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Definir Metas</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta de Ligações</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PhoneCall className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={tempGoals.call}
                onChange={(e) => handleMetaChange('call', Number(e.target.value))}
                className="pl-10 mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta de E-mails</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={tempGoals.email}
                onChange={(e) => handleMetaChange('email', Number(e.target.value))}
                className="pl-10 mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta de Chats</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MessageSquare className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={tempGoals.chat}
                onChange={(e) => handleMetaChange('chat', Number(e.target.value))}
                className="pl-10 mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setShowMetaModal(false)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveMetas}
            className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors duration-200"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );

  const generateExcelReport = () => {
    const selectedColaboradorNome = colaboradores.find(c => c.id === selectedColaborador)?.nome || 'Todos';
    const workbook = XLSX.utils.book_new();
    const worksheetData = [
      ['Relatório Detalhado de Monitorias'],
      ['Período:', `${new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })} ${selectedYear}`],
      ['Projeto:', selectedProject],
      ['Colaborador:', selectedColaboradorNome],
      [],
      ['Tipo', 'Total', 'Meta', 'Média de Resultados'],
      ['Ligação', progress.call, goals.call, resultsByType.call.toFixed(2)],
      ['E-mail', progress.email, goals.email, resultsByType.email.toFixed(2)],
      ['Chat', progress.chat, goals.chat, resultsByType.chat.toFixed(2)],
      ['Total', Object.values(progress).reduce((a, b) => a + b, 0), totalGoal, averageResult.toFixed(2)],
      [],
      ['Critérios de Ligação'],
      ...Object.entries(criteriosLigacao).map(([key, value]) => [key, value.toFixed(2)]),
      [],
      ['Critérios de E-mail'],
      ...Object.entries(criteriosEmail).map(([key, value]) => [key, value.toFixed(2)]),
      [],
      ['Critérios de Chat'],
      ...Object.entries(criteriosChat).map(([key, value]) => [key, value.toFixed(2)]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório de Monitorias');

    XLSX.writeFile(workbook, 'relatorio_monitorias.xlsx');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
            <p className="text-gray-600">Resumo das atividades</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowMetaModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center"
            >
              <Target size={20} className="mr-2" />
              Definir Meta
            </button>
            <button
              onClick={generateExcelReport}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center"
            >
              <Download size={20} className="mr-2" />
              Baixar Relatório
            </button>
          </div>
        </div>
        
        {renderDateAndProjectFilter()}
        
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
      {showMetaModal && renderMetaModal()}
    </div>
  );
};

export default Dashboard;
