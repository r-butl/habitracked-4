// global state 
import axios from 'axios';
import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext({});

// used to get user information across pages (display name for example)
export function UserContextProvider({children}) {
  const [user, setUser] = useState(null);
  // fires every time a page renders
  useEffect(() => {
    if (!user) {
      axios.get('/profile')
        .then(({ data }) => {
          setUser(data);
        })
        .catch(err => {
          console.error("Error fetching profile:", err);
        });
    }
  }, [user]);

  return (
    <UserContext.Provider value={{user, setUser}}>
      {children}
    </UserContext.Provider>
  )
}