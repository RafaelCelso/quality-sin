import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { db, collection, addDoc, updateDoc, doc, Timestamp, getDoc } from '../firebase';
import { MessageSquare, Star, Calendar, Heart, User, Clock, Zap, Briefcase } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { useAuth } from '../hooks/useAuth';

const MonitoriaChat: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { colaborador, monitoria, isEditing, isViewing } = location.state || {};
  const { user, loading } = useAuth();

  const [formData, setFormData] = useState({
    colaboradorNome: '',
    colaboradorId: '',
    avaliadorNome: '',
    avaliadorId: '',
    tipo: 'Chat',
    dataHora: '',
    cordialidadeEmpatia: { nota: 0, comentario: '' },
    linguagemInformal: { nota: 0, comentario: '' },
    tempoResposta: { nota: 0, comentario: '' },
    sequenciaEfetividade: { nota: 0, comentario: '' },
    feedback: '',
    notaMedia: 0,
    fileUrl: '',
    projeto: ''
  });

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (monitoria) {
        setFormData(monitoria);
      } else if (colaborador) {
        setFormData(prev => ({
          ...prev,
          colaboradorNome: colaborador.nome,
          colaboradorId: colaborador.id,
          projeto: colaborador.projeto // Adicionando o projeto do colaborador
        }));
      } else if (isEditing && monitoria?.colaboradorId) {
        try {
          const colaboradorDoc = await getDoc(doc(db, 'colaboradores', monitoria.colaboradorId));
          if (colaboradorDoc.exists()) {
            const colaboradorData = colaboradorDoc.data();
            setFormData(prev => ({
              ...prev,
              colaboradorNome: colaboradorData.nome,
              colaboradorId: monitoria.colaboradorId,
              projeto: colaboradorData.projeto // Adicionando o projeto do colaborador
            }));
          }
        } catch (error) {
          console.error("Error fetching collaborator data:", error);
        }
      }
    };

    loadData();
  }, [monitoria, colaborador, isEditing]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        avaliadorNome: user.displayName || '',
        avaliadorId: user.uid,
      }));
    }
  }, [user]);

  useEffect(() => {
    const novaNotaMedia = calcularNotaMedia();
    setFormData(prev => ({ ...prev, notaMedia: novaNotaMedia }));
  }, [formData.cordialidadeEmpatia.nota, formData.linguagemInformal.nota, formData.tempoResposta.nota, formData.sequenciaEfetividade.nota]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (isViewing) return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCriterioChange = (criterio: string, field: 'nota' | 'comentario', value: string | number) => {
    if (isViewing) return;
    setFormData(prev => ({
      ...prev,
      [criterio]: { ...prev[criterio as keyof typeof prev], [field]: value }
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const uploadedFile = event.target.files[0];

      try {
        // Upload do arquivo para o Firebase Storage
        const storageRef = ref(storage, `chats/${formData.colaboradorId}/${uploadedFile.name}`);
        await uploadBytes(storageRef, uploadedFile);

        // Obter a URL de download
        const downloadUrl = await getDownloadURL(storageRef);

        // Atualizar o formData com a URL do arquivo
        setFormData(prev => ({ ...prev, fileUrl: downloadUrl }));
      } catch (error) {
        console.error("Erro ao fazer upload do arquivo:", error);
        // Adicione aqui uma notificação para o usuário sobre o erro de upload
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewing) return;
    try {
      const monitoriaData = {
        ...formData,
        dataCriacao: Timestamp.now(),
        notaMedia: calcularNotaMedia(),
        avaliadorNome: user?.displayName || '',
        avaliadorId: user?.uid || '',
      };

      if (isEditing) {
        await updateDoc(doc(db, 'monitorias', monitoria.id), monitoriaData);
      } else {
        await addDoc(collection(db, 'monitorias'), monitoriaData);
      }

      navigate('/monitorias');
    } catch (error) {
      console.error("Erro ao salvar monitoria:", error);
    }
  };

  const calcularNotaMedia = () => {
    const notas = [
      formData.cordialidadeEmpatia.nota,
      formData.linguagemInformal.nota,
      formData.tempoResposta.nota,
      formData.sequenciaEfetividade.nota
    ];
    const soma = notas.reduce((acc, nota) => acc + Number(nota), 0);
    return (soma / notas.length) * 20;
  };

  const handleCancel = () => {
    navigate('/monitorias');
  };

  const getNotaMediaColor = (nota: number) => {
    if (nota < 80) return 'bg-red-100';
    if (nota < 90) return 'bg-yellow-100';
    return 'bg-emerald-100';
  };

  const criterios = [
    { key: 'cordialidadeEmpatia', icon: <Heart className="text-emerald-600" size={24} />, title: 'Cordialidade e Empatia' },
    { key: 'linguagemInformal', icon: <MessageSquare className="text-emerald-600" size={24} />, title: 'Linguagem Informal' },
    { key: 'tempoResposta', icon: <Clock className="text-emerald-600" size={24} />, title: 'Tempo de resposta/Garantia de Recebimento' },
    { key: 'sequenciaEfetividade', icon: <Zap className="text-emerald-600" size={24} />, title: 'Sequência/Efetividade' },
  ];

  const handleApplyFeedback = () => {
    setShowFeedbackModal(true);
  };

  const handleSaveFeedback = () => {
    setFormData(prev => ({
      ...prev,
      registroFeedback: feedbackText
    }));
    setShowFeedbackModal(false);
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-100">
        <h1 className="text-2xl font-bold mb-6">
          {isViewing ? 'Visualizar' : isEditing ? 'Editar' : 'Nova'} Monitoria de Chat
        </h1>
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Colaborador: {formData.colaboradorNome}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-emerald-100 p-4 rounded-lg">
              <div className="flex items-center">
                <MessageSquare className="text-emerald-600 mr-2" size={20} />
                <span className="font-medium">Tipo de Monitoria</span>
              </div>
              <p className="mt-1">{formData.tipo}</p>
            </div>
            <div className={`p-4 rounded-lg ${getNotaMediaColor(formData.notaMedia)}`}>
              <div className="flex items-center">
                <Star className="text-emerald-600 mr-2" size={20} />
                <span className="font-medium">Nota Média</span>
              </div>
              <p className="mt-1">{formData.notaMedia.toFixed(1)}%</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex items-center">
                <User className="text-emerald-600 mr-2" size={20} />
                <span className="font-medium">Avaliador</span>
              </div>
              <p className="mt-1">{formData.avaliadorNome}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex items-center">
                <Briefcase className="text-emerald-600 mr-2" size={20} />
                <span className="font-medium">Projeto</span>
              </div>
              <p className="mt-1">{formData.projeto}</p>
            </div>
          </div>
          <h3 className="text-lg font-semibold mt-6 mb-2">Informações do Atendimento</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data e Hora</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="datetime-local"
                name="dataHora"
                value={formData.dataHora}
                onChange={handleInputChange}
                className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                disabled={isViewing}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Arquivo do Chat</label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="mt-1 block w-full"
              disabled={isViewing}
            />
            {formData.fileUrl && (
              <div className="mt-2">
                <a href={formData.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Visualizar arquivo
                </a>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Critérios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {criterios.map((criterio) => (
                <div key={criterio.key} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center mb-2">
                    {criterio.icon}
                    <h4 className="text-lg font-medium ml-2">{criterio.title}</h4>
                  </div>
                  <select
                    name={`${criterio.key}.nota`}
                    value={formData[criterio.key as keyof typeof formData].nota}
                    onChange={(e) => handleCriterioChange(criterio.key, 'nota', e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                    disabled={isViewing}
                  >
                    <option value="">Selecione uma nota</option>
                    {[1, 2, 3, 4, 5].map((nota) => (
                      <option key={nota} value={nota}>{nota}</option>
                    ))}
                  </select>
                  <textarea
                    name={`${criterio.key}.comentario`}
                    value={formData[criterio.key as keyof typeof formData].comentario}
                    onChange={(e) => handleCriterioChange(criterio.key, 'comentario', e.target.value)}
                    placeholder="Comentário"
                    className="mt-2 block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                    rows={3}
                    disabled={isViewing}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Feedback</h3>
            <textarea
              name="feedback"
              value={formData.feedback}
              onChange={handleInputChange}
              placeholder="Digite seu feedback geral aqui..."
              className="mt-1 block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
              rows={5}
              disabled={isViewing}
            />
          </div>

          {formData.registroFeedback && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Registro de Feedback</h3>
              <p className="whitespace-pre-wrap">{formData.registroFeedback}</p>
            </div>
          )}

          {!isViewing && (
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyFeedback}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Aplicar Feedback
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
              >
                {isEditing ? 'Atualizar Monitoria' : 'Salvar Monitoria'}
              </button>
            </div>
          )}
        </form>

        {showFeedbackModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Aplicar Feedback</h2>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full h-40 p-2 border border-gray-300 rounded"
                placeholder="Digite o feedback aqui..."
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="mr-2 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveFeedback}
                  className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoriaChat;
