import {
  Box,
  Button,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useEffect, useState } from 'react';
import { toast } from 'material-react-toastify';
import RefreshIcon from '@mui/icons-material/Refresh';
import { authToken as authTokenAtom } from '../../../atoms/auth';
import { selectedTab as selectedTabAtom } from '../../../atoms/tabs';
import { sharedColors, sharedStyles } from '../../../utilities/styles';
import {
  getAuthTokenFromStorage,
  isAuthTokenExpired,
} from '../../../utilities/auth';
import { TabKind } from '../../../variables/tabs';
import Loading from '../../Loading';
import AppHeader from '../../AppHeader';
import { Scoreboard as ScoreboardModel } from '../../../models/scoreboard';
import { getScoreboard } from '../../../services/scoreboard';
import { formatToLocalDateTime } from '../../../utilities/time';

const Scoreboard = (): JSX.Element => {
  const { classes } = useStyles();

  const navigate = useNavigate();

  const [authToken, setAuthToken] = useRecoilState(authTokenAtom);
  const setSelectedTab = useSetRecoilState(selectedTabAtom);

  const [loading, setLoading] = useState(false);
  const [scoreboard, setScoreboard] = useState<ScoreboardModel | undefined>(
    undefined,
  );

  const refreshScoreboard = () => {
    setLoading(true);
    getScoreboard(authToken!)
      .then((fetchedScoreboard) => setScoreboard(fetchedScoreboard))
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
    setSelectedTab(TabKind.SCOREBOARD);
    document.title = 'ICFPC 2022 Scoreboard';
  }, []);

  useEffect(() => {
    if (!isAuthTokenExpired(authToken)) {
      refreshScoreboard();
    }
  }, [authToken]);

  return (
    <Box component='div' className={classes.mainContainer}>
      <Loading open={loading} />
      <AppHeader />
      <Box component='div' className={classes.headerRow}>
        <Box className={classes.scoreboardHeader}>Scoreboard</Box>
        <Box component='div' className={classes.horizontalSpacer} />
        <Button
          variant='contained'
          startIcon={<RefreshIcon />}
          style={{ ...sharedStyles.buttonText }}
          onClick={refreshScoreboard}
        >
          Refresh
        </Button>
      </Box>
      <Box component='div' className={classes.scoreboardUpdatedAt}>
        {`${
          scoreboard?.isFrozen ? 'Frozen' : 'Updated'
        } at ${formatToLocalDateTime(scoreboard?.lastUpdatedAt ?? new Date())}`}
      </Box>
      <Box component='div' className={classes.tableWrapper}>
        <TableContainer component={Paper} className={classes.tableContainer}>
          <TableHead className={classes.tableHeader}>
            <TableRow>
              <TableCell key='scoreboard-order'>
                <Box component='div' className={classes.columnLabel}>
                  Rank
                </Box>
              </TableCell>
              <TableCell key='scoreboard-order'>
                <Box component='div' className={classes.columnLabel}>
                  Team Name
                </Box>
              </TableCell>
              <TableCell align='right' key='scoreboard-order'>
                <Box component='div' className={classes.columnLabel}>
                  # Problems Solved
                </Box>
              </TableCell>
              <TableCell align='right' key='scoreboard-order'>
                <Box component='div' className={classes.columnLabel}>
                  Total Cost
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scoreboard?.userScores.map((userScore) => (
              <TableRow key={userScore.userID}>
                <TableCell>
                  <Box component='div' className={classes.tableStringField}>
                    {userScore.order}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box component='div' className={classes.tableStringField}>
                    {userScore.teamName}
                  </Box>
                </TableCell>
                <TableCell align='right'>
                  <Box component='div' className={classes.tableStringField}>
                    {userScore.solvedProblemCount}
                  </Box>
                </TableCell>
                <TableCell align='right'>
                  <Box component='div' className={classes.tableStringField}>
                    {userScore.totalCost}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableContainer>
      </Box>
    </Box>
  );
};

const useStyles = makeStyles()((theme: Theme) => ({
  mainContainer: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
  },
  headerRow: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'row',
    paddingTop: theme.spacing(3),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
  scoreboardHeader: {
    ...sharedStyles.h6,
    fontSize: 18,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  scoreboardUpdatedAt: {
    ...sharedStyles.caption,
    marginLeft: theme.spacing(3),
    marginTop: theme.spacing(1),
  },
  horizontalSpacer: {
    flexGrow: 1,
  },
  tableWrapper: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  tableContainer: {
    display: 'table',
    flexDirection: 'column',
    width: '100%',
    backgroundColor: sharedColors.gray1,
  },
  tableHeader: {
    backgroundColor: sharedColors.gray2,
  },
  columnLabel: {
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: '16px',
  },
  tableStringField: {
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontSize: '14px',
    lineHeight: '16px',
    flexDirection: 'row',
    color: sharedColors.gray6,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
}));

export default Scoreboard;
