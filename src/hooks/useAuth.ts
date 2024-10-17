import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  // Adicione outros campos conforme necessário
}

export function useAuth() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserData;
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: userData.nome || firebaseUser.displayName,
            // Adicione outros campos conforme necessário
          });
        } else {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            // Adicione outros campos conforme necessário
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}
