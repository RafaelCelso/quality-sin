import { db, collection, doc, setDoc, getDoc } from '../firebase';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const initializePermissions = async () => {
  const permissoes = [
    // ... (mantenha o array de permissões como estava)
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