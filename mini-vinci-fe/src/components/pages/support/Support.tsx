import { makeStyles } from 'tss-react/mui';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useEffect, useState } from 'react';
import { Box, Button, Grid, IconButton, TextField, Theme } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from 'react-router-dom';
import { toast } from 'material-react-toastify';
import { authToken as authTokenAtom } from '../../../atoms/auth';
import { selectedTab as selectedTabAtom } from '../../../atoms/tabs';
import { TabKind } from '../../../variables/tabs';
import AppHeader from '../../AppHeader';
import {
  getAuthTokenFromStorage,
  isAuthTokenExpired,
} from '../../../utilities/auth';
import { SupportMessage } from '../../../models/support';
import Loading from '../../Loading';
import { getSupportHistory, sendMessage } from '../../../services/support';
import ConfirmSendDialog from './ConfirmSendDialog';
import MessagePaper from './MessagePaper';
import { multiClass, sharedStyles } from '../../../utilities/styles';

const Support = (): JSX.Element => {
  const { classes } = useStyles();

  const navigate = useNavigate();

  const [authToken, setAuthToken] = useRecoilState(authTokenAtom);
  const setSelectedTab = useSetRecoilState(selectedTabAtom);

  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [maxMessages, setMaxMessages] = useState(5);

  const initializeTokenFromStorage = () => {
    const storedAuthToken = getAuthTokenFromStorage();
    if (isAuthTokenExpired(storedAuthToken)) {
      navigate('/login');
    } else {
      setAuthToken(storedAuthToken);
    }
  };

  const refreshSupportMessages = () => {
    setLoading(true);
    getSupportHistory(authToken!)
      .then((receivedSupportMessages) =>
        setSupportMessages(receivedSupportMessages),
      )
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setSelectedTab(TabKind.SUPPORT);
    document.title = 'Support';
    initializeTokenFromStorage();
  }, []);

  useEffect(() => {
    if (!isAuthTokenExpired(authToken)) {
      refreshSupportMessages();
    }
  }, [authToken]);

  const handleChangeTypedMessage = (e: any) => {
    setTypedMessage(e.target.value as string);
  };

  const handleSend = () => {
    if (typedMessage === '') {
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleTextFieldKeyDown = (e: any) => {
    if (e.keyCode === 13) {
      handleSend();
    }
  };

  const handleConfirmSend = () => {
    setLoading(true);
    setShowConfirmDialog(false);
    sendMessage(typedMessage, authToken!)
      .then(() => {
        setTypedMessage('');
        refreshSupportMessages();
      })
      .catch((err) => {
        toast.error(err.message);
        setLoading(false);
      });
  };

  return (
    <Box component='div' className={classes.mainContainer}>
      <AppHeader />
      <ConfirmSendDialog
        open={showConfirmDialog}
        message={typedMessage}
        onConfirm={handleConfirmSend}
        onClose={() => setShowConfirmDialog(false)}
      />
      <Loading open={loading} />
      <Grid container spacing={1} className={classes.messageGrid}>
        {supportMessages.length === 0 && (
          <Grid item xs={12}>
            <Box component='div' className={classes.emptyMessageContainer}>
              <Box className={classes.emptyMessageText}>
                Message history is empty
              </Box>
            </Box>
          </Grid>
        )}

        <Grid item xs={12}>
          <Box component='div' className={classes.row}>
            {supportMessages.length > maxMessages ? (
              <Button
                color='primary'
                style={{ ...sharedStyles.buttonText }}
                onClick={() => setMaxMessages(maxMessages * 2)}
              >
                Load more
              </Button>
            ) : (
              <Box />
            )}
          </Box>
        </Grid>

        {supportMessages.slice(-maxMessages).map((supportMessage) => [
          <Grid item xs={3} />,
          <Grid item xs={6}>
            <MessagePaper supportMessage={supportMessage} teamName={'you'} />
          </Grid>,
          <Grid item xs={3} />,
        ])}
        <Grid item xs={3} />
        <Grid item xs={6}>
          <Box
            component='div'
            className={multiClass([classes.row, classes.newMessageTextField])}
          >
            <TextField
              variant='standard'
              placeholder='New message'
              fullWidth
              onChange={handleChangeTypedMessage}
              onKeyDown={handleTextFieldKeyDown}
              value={typedMessage}
            />
            <IconButton disabled={typedMessage === ''} onClick={handleSend}>
              <SendIcon />
            </IconButton>
          </Box>
        </Grid>
        <Grid item xs={3} />
      </Grid>
    </Box>
  );
};

const useStyles = makeStyles()((theme: Theme) => ({
  mainContainer: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
  },
  messageGrid: {
    display: 'flex',
    flexGrow: 1,
  },
  emptyMessageContainer: {
    display: 'flex',
    flexGrow: 1,
    paddingTop: theme.spacing(1),
  },
  emptyMessageText: {
    marginLeft: 'auto',
    marginRight: 'auto',
    fontStyle: 'italic',
  },
  row: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  newMessageTextField: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(2),
  },
}));

export default Support;
