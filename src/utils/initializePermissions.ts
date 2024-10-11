import { db, collection, doc, setDoc, getDoc } from '../firebase';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
        'Visualizar Monitoria': true,
        'Visualizar Colaboradores': true,
        'Criar Colaborador': true,
        'Editar Colaborador': true,
        'Excluir Colaborador': true,
        'Visualizar Usuários': true,
        'Criar Usuário': true,
        'Editar Usuário': true,
        'Excluir Usuário': true,
        'Gerenciar Permissões': true,
        'Visualizar Cargos': true,
        'Criar Cargo': true,
        'Editar Cargo': true,
        'Excluir Cargo': true,
        'Visualizar Projetos': true,
        'Criar Projeto': true,
        'Editar Projeto': true,
        'Excluir Projeto': true,
        'Acessar Perfil': true,
        'Editar Perfil': true,
      }
    },
    {
      id: 'assistente',
      nome: 'Assistente',
      acessos: {
        'Visualizar Dashboard': false,
        'Criar Monitoria': false,
        'Editar Monitoria': false,
        'Excluir Monitoria': false,
        'Visualizar Monitoria': true,
        'Visualizar Colaboradores': false,
        'Criar Colaborador': false,
        'Editar Colaborador': false,
        'Excluir Colaborador': false,
        'Visualizar Usuários': false,
        'Criar Usuário': false,
        'Editar Usuário': false,
        'Excluir Usuário': false,
        'Gerenciar Permissões': false,
        'Visualizar Cargos': false,
        'Criar Cargo': false,
        'Editar Cargo': false,
        'Excluir Cargo': false,
        'Visualizar Projetos': false,
        'Criar Projeto': false,
        'Editar Projeto': false,
        'Excluir Projeto': false,
        'Acessar Perfil': true,
        'Editar Perfil': true,
      }
    },
  ];

  const permissoesRef = collection(db, 'permissoes');

  try {
    for (const permissao of permissoes) {
      const docRef = doc(permissoesRef, permissao.id);
      let retries = 3;
      while (retries > 0) {
        try {
          const docSnap = await getDoc(docRef);

          if (!docSnap.exists()) {
            await setDoc(docRef, permissao);
            console.log(`Permissão ${permissao.nome} inicializada.`);
          } else {
            const existingData = docSnap.data();
            if (JSON.stringify(existingData.acessos) !== JSON.stringify(permissao.acessos)) {
              await setDoc(docRef, permissao, { merge: true });
              console.log(`Permissão ${permissao.nome} atualizada.`);
            } else {
              console.log(`Permissão ${permissao.nome} já está atualizada.`);
            }
          }
          break; // Sai do loop se a operação for bem-sucedida
        } catch (error: any) {
          if (error.code === 'resource-exhausted' && retries > 1) {
            retries--;
            await delay(2000); // Espera 2 segundos antes de tentar novamente
          } else {
            throw error; // Lança o erro se não for 'resource-exhausted' ou se for a última tentativa
          }
        }
      }
      await delay(500); // Adiciona um pequeno atraso entre as operações
    }
    console.log('Permissões inicializadas/atualizadas com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar/atualizar permissões:', error);
  }
};

export default initializePermissions;