import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { db, collection, addDoc, updateDoc, doc, Timestamp } from '../firebase';
import { MessageSquare, Star, Calendar, Heart, User, Clock, Zap } from 'lucide-react';

const MonitoriaChat: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { colaborador, tipoMonitoria, monitoria, isEditing } = location.state || {};

  const [formData, setFormData] = useState({
    colaboradorNome: '',
    colaboradorId: '',
    tipo: 'Chat',
    dataHora: '',
    cordialidadeEmpatia: { nota: 0, comentario: '' },
    linguagemInformal: { nota: 0, comentario: '' },
    tempoResposta: { nota: 0, comentario: '' },
    sequenciaEfetividade: { nota: 0, comentario: '' },
    feedback: '',
    notaMedia: 0
  });

  useEffect(() => {
    if (colaborador) {
      setFormData(prev => ({
        ...prev,
        colaboradorNome: colaborador.nome,
        colaboradorId: colaborador.id
      }));
    }
    if (monitoria) {
      setFormData(monitoria);
    }
  }, [colaborador, monitoria]);

  useEffect(() => {
    const novaNotaMedia = calcularNotaMedia();
    setFormData(prev => ({ ...prev, notaMedia: novaNotaMedia }));
  }, [formData.cordialidadeEmpatia.nota, formData.linguagemInformal.nota, formData.tempoResposta.nota, formData.sequenciaEfetividade.nota]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCriterioChange = (criterio: string, field: 'nota' | 'comentario', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [criterio]: { ...prev[criterio as keyof typeof prev], [field]: value }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const monitoriaData = {
        ...formData,
        dataCriacao: Timestamp.now(),
        notaMedia: calcularNotaMedia()
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
    return (soma / notas.length) * 20; // Multiplicamos por 20 para converter a escala de 1-5 para 0-100
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

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-100">
        <h1 className="text-2xl font-bold mb-6">Monitoria de Chat</h1>
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">{formData.colaboradorNome}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              />
            </div>
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
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
            >
              {isEditing ? 'Atualizar Monitoria' : 'Salvar Monitoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MonitoriaChat;