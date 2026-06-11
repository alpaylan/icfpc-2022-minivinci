import React, { useEffect } from 'react';
import { Box } from '@mui/material';

import { useRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { authToken as authTokenAtom } from '../atoms/auth';
import { getAuthTokenFromStorage } from '../utilities/auth';

const App = (): JSX.Element => {
  const navigate = useNavigate();
  const [authToken, setAuthToken] = useRecoilState(authTokenAtom);

  const initializeTokenFromStorage = () => {
    setAuthToken(getAuthTokenFromStorage());
  };

  useEffect(initializeTokenFromStorage, []);
  useEffect(() => {
    // Browse-first: signed-in users go to their dashboard, everyone else lands
    // on the specification page that explains what the contest is.
    if (authToken) {
      navigate('/dashboard');
    } else {
      navigate('/specification');
    }
  }, [authToken]);

  return <Box>Redirecting...</Box>;
};

export default App;
