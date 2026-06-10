import { Box, Paper, Theme } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'material-react-toastify';
import { authToken as authTokenAtom } from '../../../atoms/auth';
import AppHeader from '../../AppHeader';
import { selectedTab as selectedTabAtom } from '../../../atoms/tabs';
import { TabKind } from '../../../variables/tabs';
import {
  getAuthTokenFromStorage,
  isAuthTokenExpired,
} from '../../../utilities/auth';
import { getAnnouncements } from '../../../services/announcements';
import { Announcement } from '../../../models/announcement';
import Loading from '../../Loading';
import { sharedColors, sharedStyles } from '../../../utilities/styles';
import { formatToLocalDateTime } from '../../../utilities/time';

const Announcements = (): JSX.Element => {
  const { classes } = useStyles();

  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState([] as Announcement[]);
  const [authToken, setAuthToken] = useRecoilState(authTokenAtom);
  const setSelectedTab = useSetRecoilState(selectedTabAtom);
  const [loading, setLoading] = useState(false);

  const refreshAnnouncements = () => {
    setLoading(true);
    getAnnouncements(authToken!)
      .then((announcementsList) => setAnnouncements(announcementsList))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  const initializeTokenFromStorage = () => {
    const storedAuthToken = getAuthTokenFromStorage();
    if (isAuthTokenExpired(storedAuthToken)) {
      navigate('/login');
    } else {
      setAuthToken(storedAuthToken);
    }
  };

  useEffect(() => {
    initializeTokenFromStorage();
    setSelectedTab(TabKind.ANNOUNCEMENTS);
    document.title = 'Announcements';
  }, []);

  useEffect(() => {
    if (!isAuthTokenExpired(authToken)) {
      refreshAnnouncements();
    }
  }, [authToken]);

  return (
    <Box component='div' className={classes.mainContainer}>
      <Loading open={loading} />
      <AppHeader />
      <Box component='div' className={classes.messagesContainer}>
        {announcements.map((announcement) => (
          <Paper
            style={{ backgroundColor: sharedColors.gray1 }}
            className={classes.paper}
          >
            <Box
              component='div'
              style={{ ...sharedStyles.caption }}
              className={classes.description}
            >
              {formatToLocalDateTime(announcement.time)}
            </Box>
            <Box component='div' style={{ ...sharedStyles.body1 }}>
              {announcement.content}
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

const useStyles = makeStyles()((theme: Theme) => ({
  paper: {
    marginBottom: theme.spacing(1),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    padding: theme.spacing(1),
  },
  description: {
    color: sharedColors.gray5,
    marginBottom: theme.spacing(0.5),
  },
  messagesContainer: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    paddingTop: theme.spacing(1.5),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
  mainContainer: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
  },
}));

export default Announcements;
