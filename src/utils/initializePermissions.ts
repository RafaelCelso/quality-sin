import { db, collection, doc, setDoc } from '../firebase';

const initializePermissions = async () => {
  const permissoes = [
    {
      id: 'admin',
      nome: 'Admin',
      acessos: {
        'Visualizar Dashboard': true,
        'Criar Monitoria': true,
        'Editar Monitoria': true,
        'Excluir Monitoria': true,
        'Visualizar Colaboradores': true,
        'Criar Colaborador': true,
        'Editar Colaborador': true,
        'Excluir Colaborador': true,
        'Visualizar Usuários': true,
        'Criar Usuário': true,
        'Editar Usuário': true,
        'Excluir Usuário': true,
        'Gerenciar Permissões': true,
      }
    },
    {
      id: 'assistente',
      nome: 'Assistente',
      acessos: {
        'Visualizar Dashboard': true,
        'Criar Monitoria': false,
        'Editar Monitoria': false,
        'Excluir Monitoria': false,
        'Visualizar Colaboradores': true,
        'Criar Colaborador': false,
        'Editar Colaborador': false,
        'Excluir Colaborador': false,
        'Visualizar Usuários': false,
        'Criar Usuário': false,
        'Editar Usuário': false,
        'Excluir Usuário': false,
        'Gerenciar Permissões': false,
      }
    },
    {
      id: 'qualidade',
      nome: 'Qualidade',
      acessos: {
        'Visualizar Dashboard': true,
        'Criar Monitoria': true,
        'Editar Monitoria': true,
        'Excluir Monitoria': false,
        'Visualizar Colaboradores': true,
        'Criar Colaborador': false,
        'Editar Colaborador': false,
        'Excluir Colaborador': false,
        'Visualizar Usuários': false,
        'Criar Usuário': false,
        'Editar Usuário': false,
        'Excluir Usuário': false,
        'Gerenciar Permissões': false,
      }
    },
    {
      id: 'supervisor',
      nome: 'Supervisor',
      acessos: {
        'Visualizar Dashboard': true,
        'Criar Monitoria': true,
        'Editar Monitoria': true,
        'Excluir Monitoria': true,
        'Visualizar Colaboradores': true,
        'Criar Colaborador': true,
        'Editar Colaborador': true,
        'Excluir Colaborador': false,
        'Visualizar Usuários': true,
        'Criar Usuário': false,
        'Editar Usuário': false,
        'Excluir Usuário': false,
        'Gerenciar Permissões': false,
      }
    }
  ];

  const permissoesRef = collection(db, 'permissoes');

  try {
    for (const permissao of permissoes) {
      await setDoc(doc(permissoesRef, permissao.id), permissao);
    }
    console.log('Permissões inicializadas com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar permissões:', error);
  }
};

export default initializePermissions;