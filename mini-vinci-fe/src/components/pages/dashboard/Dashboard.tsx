import {
  Box,
  Button,
  IconButton,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BrushIcon from '@mui/icons-material/Brush';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import ErrorIcon from '@mui/icons-material/Error';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { makeStyles } from 'tss-react/mui';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useEffect, useState } from 'react';
import { toast } from 'material-react-toastify';
import { useNavigate } from 'react-router-dom';
import { authToken as authTokenAtom } from '../../../atoms/auth';
import { selectedTab as selectedTabAtom } from '../../../atoms/tabs';
import AppHeader from '../../AppHeader';
import { TabKind } from '../../../variables/tabs';
import { sharedColors, sharedStyles } from '../../../utilities/styles';
import { Submission } from '../../../models/submission';
import { formatToLocalDateTime } from '../../../utilities/time';
import { formatSubmissionStatus } from '../../../utilities/submission';
import { SubmissionStatus } from '../../../variables/submission';
import NewSubmission from '../../NewSubmission';
import {
  getAuthTokenFromStorage,
  isAuthTokenExpired,
} from '../../../utilities/auth';
import Loading from '../../Loading';
import {
  getSubmission,
  getSubmissionsList,
} from '../../../services/submission';
import ApiKeyDialog from './ApiKeyDialog';

const Dashboard = (): JSX.Element => {
  const { classes } = useStyles();

  const navigate = useNavigate();

  const [authToken, setAuthToken] = useRecoilState(authTokenAtom);
  const setSelectedTab = useSetRecoilState(selectedTabAtom);

  const refreshSubmissions = () => {
    setLoading(true);
    getSubmissionsList(authToken!)
      .then((submissionsList) => {
        setSubmissions(submissionsList);
      })
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
    setSelectedTab(TabKind.DASHBOARD);
    document.title = 'ICFPC 2022 Dashboard';
  }, []);

  useEffect(() => {
    if (!isAuthTokenExpired(authToken)) {
      refreshSubmissions();
    }
  }, [authToken]);

  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showNewSubmissionDialog, setShowNewSubmissionDialog] = useState(false);
  const [showApiTokenDialog, setShowApiTokenDialog] = useState(false);

  const submissionStatusIcon = (status: SubmissionStatus): JSX.Element => {
    switch (status) {
      case SubmissionStatus.QUEUED:
        return <AccessTimeIcon fontSize='small' />;
      case SubmissionStatus.PROCESSING:
        return <BrushIcon fontSize='small' />;
      case SubmissionStatus.FAILED:
        return <ErrorIcon fontSize='small' />;
      case SubmissionStatus.SUCCEEDED:
      default:
        return <CheckCircleIcon fontSize='small' />;
    }
  };

  const submissionStatusColor = (status: SubmissionStatus): string => {
    switch (status) {
      case SubmissionStatus.QUEUED:
        return sharedColors.gray5;
      case SubmissionStatus.PROCESSING:
        return sharedColors.gray6;
      case SubmissionStatus.SUCCEEDED:
        return sharedColors.statusGreen;
      case SubmissionStatus.FAILED:
        return sharedColors.statusRed;
      default:
        return 'black';
    }
  };

  const handleClickNewSubmission = () => setShowNewSubmissionDialog(true);
  const handleCloseNewSubmission = () => setShowNewSubmissionDialog(false);
  const handleNewSubmission = () => {
    setShowNewSubmissionDialog(false);
    toast.success('Successfully made a new submission');
    refreshSubmissions();
  };

  const handleDownloadSubmission = (submission: Submission) => {
    setLoading(true);
    getSubmission(submission.id, authToken!)
      .then((retrievedSubmission) => {
        const link = document.createElement('a');
        link.download = `submission-${submission.id}.isl`;
        link.href = retrievedSubmission.fileUrl;
        link.click();
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <Box component='div' className={classes.mainContainer}>
      <Loading open={loading} />
      <AppHeader />
      <NewSubmission
        open={showNewSubmissionDialog}
        onClose={handleCloseNewSubmission}
        onSubmit={handleNewSubmission}
      />
      <ApiKeyDialog
        open={showApiTokenDialog}
        onClose={() => setShowApiTokenDialog(false)}
      />
      <Box component='div' className={classes.headerRow}>
        <Box className={classes.submissionsHeader}>Submissions</Box>
        <Box component='div' className={classes.horizontalSpacer} />
        <Box component='div' className={classes.apiKeyButton}>
          <Button
            variant='contained'
            startIcon={<VpnKeyIcon />}
            onClick={() => setShowApiTokenDialog(true)}
            style={{ ...sharedStyles.buttonText }}
            className={classes.apiKeyButton}
          >
            API Key
          </Button>
        </Box>
        <Button
          variant='contained'
          startIcon={<NoteAddIcon />}
          style={{ ...sharedStyles.buttonText }}
          onClick={handleClickNewSubmission}
        >
          New Submission
        </Button>
      </Box>
      <Box component='div' className={classes.tableWrapper}>
        <TableContainer component={Paper} className={classes.tableContainer}>
          <TableHead className={classes.tableHeader}>
            <TableRow>
              <TableCell key='submission-number'>
                <Box component='div' className={classes.columnLabel}>
                  #
                </Box>
              </TableCell>
              <TableCell key='submitted-at'>
                <Box component='div' className={classes.columnLabel}>
                  Submitted At
                </Box>
              </TableCell>
              <TableCell key='problem-id'>
                <Box component='div' className={classes.columnLabel}>
                  Problem ID
                </Box>
              </TableCell>
              <TableCell key='submission-id'>
                <Box component='div' className={classes.columnLabel}>
                  Submission ID
                </Box>
              </TableCell>
              <TableCell align='right' key='submission-id'>
                <Box component='div' className={classes.columnLabel}>
                  Cost
                </Box>
              </TableCell>
              <TableCell align='center' key='submission-id'>
                <Box component='div' className={classes.columnLabel}>
                  Status
                </Box>
              </TableCell>
              <TableCell align='center' key='submission-id'>
                <Box component='div' className={classes.columnLabel}>
                  Submitted Code
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>
                  <Box component='div' className={classes.tableStringField}>
                    {submission.submissionNumber}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box component='div' className={classes.tableStringField}>
                    {formatToLocalDateTime(submission.date)}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box component='div' className={classes.tableStringField}>
                    {submission.problemID}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box component='div' className={classes.tableStringField}>
                    {submission.id}
                  </Box>
                </TableCell>
                <TableCell align='right'>
                  <Box component='div' className={classes.tableStringField}>
                    {submission.score ?? 'N/A'}
                  </Box>
                </TableCell>
                <TableCell align='center'>
                  <Button
                    style={{
                      color: submissionStatusColor(submission.status),
                      ...sharedStyles.buttonText,
                    }}
                    endIcon={submissionStatusIcon(submission.status)}
                  >
                    {formatSubmissionStatus(submission.status)}
                  </Button>
                </TableCell>
                <TableCell align='center'>
                  <IconButton
                    color='primary'
                    onClick={() => handleDownloadSubmission(submission)}
                  >
                    <DownloadIcon />
                  </IconButton>
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
    padding: theme.spacing(3),
  },
  submissionsHeader: {
    ...sharedStyles.h6,
    fontSize: 18,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  horizontalSpacer: {
    flexGrow: 1,
  },
  apiKeyButton: {
    marginRight: theme.spacing(1),
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

export default Dashboard;
