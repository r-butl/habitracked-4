import { createContext, useState, useEffect } from 'react';
import { getProfile } from '../utils/api';

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!user) {
      getProfile()
        .then(data => {
          setUser(data);
        })
        .catch(err => {
          console.error("Error fetching profile:", err);
        });
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}