import { useState, useEffect } from 'react';
import { auth, db, collection, query, where, getDocs } from '../firebase';

interface Permissoes {
  [key: string]: boolean;
}

const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permissoes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userQuery = query(collection(db, 'usuarios'), where('uid', '==', user.uid));
          const userSnapshot = await getDocs(userQuery);
          
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            const userPermissao = userData.permissao;

            const permissoesQuery = query(collection(db, 'permissoes'), where('nome', '==', userPermissao));
            const permissoesSnapshot = await getDocs(permissoesQuery);

            if (!permissoesSnapshot.empty) {
              const permissoesData = permissoesSnapshot.docs[0].data();
              setPermissions(permissoesData.acessos);
            }
          }
        } catch (error) {
          console.error('Erro ao buscar permissões:', error);
        }
      }
      setLoading(false);
    };

    fetchPermissions();
  }, []);

  const checkPermission = (permission: string) => {
    if (!permissions) return false;
    return permissions[permission] || false;
  };

  return { permissions, loading, checkPermission };
};

export default usePermissions;