import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import 'material-react-toastify/dist/ReactToastify.css';

import { RecoilRoot } from 'recoil';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { ToastContainer } from 'material-react-toastify';
import Login from './components/pages/login/Login';
import Dashboard from './components/pages/dashboard/Dashboard';
import App from './components/App';
import Announcements from './components/pages/announcements/Announcements';
import { TabURL } from './variables/tabs';
import Support from './components/pages/support/Support';
import Playground from './components/pages/playground/Playground';
import ResetPassword from './components/pages/reset-password/ResetPassword';
import Problems from './components/pages/problems/Problems';
import Scoreboard from './components/pages/scoreboard/Scoreboard';
import Results from './components/pages/results/Results';
import SourceCode from './components/pages/sourcecode/SourceCode';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <RecoilRoot>
      <ThemeProvider theme={createTheme()}>
        <BrowserRouter>
          <Routes>
            <Route path={TabURL.LOGIN} element={<Login />} />
            <Route path={TabURL.DASHBOARD} element={<Dashboard />} />
            <Route path={TabURL.PROBLEMS} element={<Problems />} />
            <Route path={TabURL.SCOREBOARD} element={<Scoreboard />} />
            <Route path={TabURL.ANNOUNCEMENTS} element={<Announcements />} />
            <Route path={TabURL.PLAYGROUND} element={<Playground />} />
            <Route path={TabURL.SUPPORT} element={<Support />} />
            <Route path={TabURL.RESULTS} element={<Results />} />
            <Route path={TabURL.SOURCE_CODE} element={<SourceCode />} />
            <Route
              path={`${TabURL.RESET_PASSWORD}`}
              element={<ResetPassword />}
            />
            <Route path='*' element={<App />} />
          </Routes>
          <ToastContainer
            position='top-center'
            autoClose={6000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            draggable
            pauseOnHover
          />
        </BrowserRouter>
      </ThemeProvider>
    </RecoilRoot>
  </React.StrictMode>,
);
