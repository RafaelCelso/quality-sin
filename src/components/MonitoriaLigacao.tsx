import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Phone, Heart, MessageSquare, Target, User, Star, Clock, Award, MessageCircle, Smile, Shield, Lightbulb, UserCheck, Flag, Zap } from 'lucide-react';
import { db, collection, addDoc, doc, updateDoc, Timestamp } from '../firebase';

const MonitoriaLigacao: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [colaborador, setColaborador] = useState<any>(null);
  const [formData, setFormData] = useState({
    duracao: '',
    dataHora: '',
    cordialidade: '',
    linguagem: '',
    efetividade: '',
    personalizacao: '',
    feedback: '',
    sinpatia: {
      reconheca: '',
      assegure: '',
      explique: '',
      personalize: '',
      represente: '',
      enriqueca: ''
    }
  });

  useEffect(() => {
    if (location.state && location.state.colaborador) {
      setColaborador(location.state.colaborador);
    }
  }, [location.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSinpatiaChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      sinpatia: {
        ...prevState.sinpatia,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const monitoriaData = {
        ...formData,
        colaboradorId: colaborador?.id,
        colaboradorNome: colaborador?.nome,
        tipo: 'Ligação',
        dataCriacao: Timestamp.now()
      };
      await addDoc(collection(db, 'monitorias'), monitoriaData);
      navigate('/monitorias');
    } catch (error) {
      console.error('Erro ao salvar monitoria:', error);
    }
  };

  const handleCancel = () => {
    navigate('/monitorias');
  };

  const calcularNotaMedia = () => {
    const notas = [formData.cordialidade, formData.linguagem, formData.efetividade, formData.personalizacao]
      .filter(nota => nota !== '')
      .map(Number);
    if (notas.length === 0) return '0';
    const media = (notas.reduce((a, b) => a + b, 0) / notas.length) * 20; // Multiplicamos por 20 para converter para percentual
    return media.toFixed(1);
  };

  const criterios = [
    { nome: 'cordialidade', icone: <Heart className="text-red-500" size={20} /> },
    { nome: 'linguagem', icone: <MessageSquare className="text-blue-500" size={20} /> },
    { nome: 'efetividade', icone: <Target className="text-green-500" size={20} /> },
    { nome: 'personalizacao', icone: <User className="text-purple-500" size={20} /> }
  ];

  const sinpatiaCriterios = [
    { nome: 'reconheca', icone: <Smile className="text-yellow-500" size={20} /> },
    { nome: 'assegure', icone: <Shield className="text-blue-500" size={20} /> },
    { nome: 'explique', icone: <Lightbulb className="text-orange-500" size={20} /> },
    { nome: 'personalize', icone: <UserCheck className="text-green-500" size={20} /> },
    { nome: 'represente', icone: <Flag className="text-red-500" size={20} /> },
    { nome: 'enriqueca', icone: <Zap className="text-purple-500" size={20} /> }
  ];

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Monitoria de Ligação</h1>
        <h2 className="text-2xl font-semibold mb-4">{colaborador?.nome || 'Colaborador não selecionado'}</h2>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-100 p-4 rounded-lg shadow">
              <Phone className="text-blue-500 mb-2" size={24} />
              <h3 className="font-bold">Tipo de Monitoria</h3>
              <p>Ligação</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg shadow">
              <Star className="text-green-500 mb-2" size={24} />
              <h3 className="font-bold">Nota Média</h3>
              <p>{calcularNotaMedia()}%</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Informações do atendimento</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Duração</label>
                <input
                  type="text"
                  name="duracao"
                  value={formData.duracao}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="00:00:00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Data e hora</label>
                <input
                  type="datetime-local"
                  name="dataHora"
                  value={formData.dataHora}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Critérios</h3>
            <div className="grid grid-cols-2 gap-4">
              {criterios.map((criterio) => (
                <div key={criterio.nome} className="bg-white p-4 rounded-lg shadow-md">
                  <div className="flex items-center mb-2">
                    {criterio.icone}
                    <h4 className="font-semibold capitalize ml-2">{criterio.nome}</h4>
                  </div>
                  <select
                    name={criterio.nome}
                    value={formData[criterio.nome as keyof typeof formData]}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-lg font-semibold bg-gray-100 py-2"
                  >
                    <option value="">Selecione uma nota</option>
                    {[1, 2, 3, 4, 5].map((nota) => (
                      <option key={nota} value={nota}>{nota}</option>
                    ))}
                  </select>
                  <textarea
                    name={`${criterio.nome}Comentario`}
                    placeholder="Comentário"
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    rows={3}
                  ></textarea>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">SINPATIA</h3>
            <div className="grid grid-cols-2 gap-4">
              {sinpatiaCriterios.map((criterio) => (
                <div key={criterio.nome} className="bg-white p-4 rounded-lg shadow-md">
                  <div className="flex items-center mb-2">
                    {criterio.icone}
                    <h4 className="font-semibold capitalize ml-2">{criterio.nome}</h4>
                  </div>
                  <select
                    name={criterio.nome}
                    value={formData.sinpatia[criterio.nome as keyof typeof formData.sinpatia]}
                    onChange={handleSinpatiaChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-lg font-semibold bg-gray-100 py-2"
                  >
                    <option value="">Selecione uma opção</option>
                    <option value="Realizado">Realizado</option>
                    <option value="Oportunidade">Oportunidade</option>
                    <option value="Não se aplica">Não se aplica</option>
                  </select>
                  <textarea
                    name={`${criterio.nome}Comentario`}
                    placeholder="Comentário"
                    onChange={handleSinpatiaChange}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    rows={3}
                  ></textarea>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Feedback</h3>
            <textarea
              name="feedback"
              value={formData.feedback}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              rows={4}
              placeholder="Digite o feedback aqui..."
            ></textarea>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2 hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600"
            >
              Salvar Monitoria
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MonitoriaLigacao;