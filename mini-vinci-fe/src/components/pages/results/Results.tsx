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
import { UserResult as UserResultModel } from '../../../models/results';
import { getResults } from '../../../services/results';
import { formatToLocalDateTime } from '../../../utilities/time';

const Results = (): JSX.Element => {
  const { classes } = useStyles();

  const navigate = useNavigate();

  const [authToken, setAuthToken] = useRecoilState(authTokenAtom);
  const setSelectedTab = useSetRecoilState(selectedTabAtom);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<UserResultModel | undefined>(
    undefined,
  );

  const refreshResults = () => {
    setLoading(true);
    getResults(authToken!)
      .then((fetchedUserResults) => setResults(fetchedUserResults))
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
    setSelectedTab(TabKind.RESULTS);
    document.title = 'ICFPC 2022 Results';
  }, []);

  useEffect(() => {
    if (!isAuthTokenExpired(authToken)) {
      refreshResults();
    }
  }, [authToken]);

  return (
    <Box component='div' className={classes.mainContainer}>
      <Loading open={loading} />
      <AppHeader />
      <Box component='div' className={classes.headerRow}>
        <Box className={classes.resultsHeader}>Your Results</Box>
        <Box component='div' className={classes.horizontalSpacer} />
        <Button
          variant='contained'
          startIcon={<RefreshIcon />}
          style={{ ...sharedStyles.buttonText }}
          onClick={refreshResults}
        >
          Refresh
        </Button>
      </Box>
      <Box component='div' className={classes.resultInfo}>
        Solved Problem Count: {results?.solvedProblemCount}
      </Box>
      <Box component='div' className={classes.resultInfo}>
        Total Cost: {results?.totalCost}
      </Box>
      <Box component='div' className={classes.tableWrapper}>
        <TableContainer component={Paper} className={classes.tableContainer}>
          <TableHead className={classes.tableHeader}>
            <TableRow>
              <TableCell key='results-problem-id'>
                <Box component='div' className={classes.columnLabel}>
                  Problem ID
                </Box>
              </TableCell>
              <TableCell key='results-problem-name'>
                <Box component='div' className={classes.columnLabel}>
                  Problem Name
                </Box>
              </TableCell>
              <TableCell key='results-minimum-cost'>
                <Box component='div' className={classes.columnLabel}>
                  Minimum Cost
                </Box>
              </TableCell>
              <TableCell key='results-submission-count'>
                <Box component='div' className={classes.columnLabel}>
                  Successful Submission Count
                </Box>
              </TableCell>
              <TableCell key='results-last-submission-time'>
                <Box component='div' className={classes.columnLabel}>
                  Last Submission Time
                </Box>
              </TableCell>
              <TableCell key='results-overall-best-cost'>
                <Box component='div' className={classes.columnLabel}>
                  Overall Best Cost
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results?.results.map((problemResult) => (
              <TableRow key={problemResult.problemId}>
                <TableCell>
                  <Box component='div' className={classes.tableStringField}>
                    {problemResult.problemId}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box component='div' className={classes.tableStringField}>
                    {problemResult.problemName}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box component='div' className={classes.tableStringField}>
                    {problemResult.minCost}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box component='div' className={classes.tableStringField}>
                    {problemResult.submissionCount}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box component='div' className={classes.tableStringField}>
                    {problemResult.submissionCount ? formatToLocalDateTime(problemResult?.lastSubmittedAt ?? new Date()) : '-'}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box component='div' className={classes.tableStringField}>
                    {problemResult.overallBestCost ? problemResult.overallBestCost : '-'}
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
  resultsHeader: {
    ...sharedStyles.h6,
    fontSize: 18,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  resultInfo: {
    ...sharedStyles.caption,
    fontSize: 16,
    marginLeft: theme.spacing(3),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
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

export default Results;
