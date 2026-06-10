import { useRecoilState, useSetRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import DownloadIcon from '@mui/icons-material/Download';
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Theme,
} from '@mui/material';
import { toast } from 'material-react-toastify';
import { find } from 'lodash';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { selectedTab as selectedTabAtom } from '../../../atoms/tabs';
import { authToken as authTokenAtom } from '../../../atoms/auth';
import {
  getAuthTokenFromStorage,
  isAuthTokenExpired,
} from '../../../utilities/auth';
import { TabKind } from '../../../variables/tabs';
import Loading from '../../Loading';
import AppHeader from '../../AppHeader';
import { Problem } from '../../../models/problem';
import { getProblems } from '../../../services/problem';
import NewSubmission from '../../NewSubmission';
import { sharedStyles } from '../../../utilities/styles';

const Problems = (): JSX.Element => {
  const { classes } = useStyles();

  const navigate = useNavigate();

  const [authToken, setAuthToken] = useRecoilState(authTokenAtom);
  const setSelectedTab = useSetRecoilState(selectedTabAtom);

  const [loading, setLoading] = useState(false);
  const [problems, setProblems] = useState([] as Problem[]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | undefined>(
    undefined,
  );
  const [showNewSubmissionDialog, setShowNewSubmissionDialog] = useState(false);

  const refreshProblems = () => {
    setLoading(true);
    getProblems(authToken!)
      .then((problemsList) => {
        setProblems(problemsList);
        if (problemsList.length > 0) {
          setSelectedProblem(problemsList[0]);
        }
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
    setSelectedTab(TabKind.PROBLEMS);
    document.title = 'ICFPC 2022 Problems';
  }, []);

  useEffect(() => {
    if (!isAuthTokenExpired(authToken)) {
      refreshProblems();
    }
  }, [authToken]);

  const handleChangeSelectedProblem = (e: any) => {
    const selectedProblemID = e.target.value.toString();
    const newSelectedProblem = find(
      problems,
      (problem) => problem.id.toString() === selectedProblemID,
    );
    setSelectedProblem(newSelectedProblem);
  };

  const handleClickNewSubmission = () => setShowNewSubmissionDialog(true);
  const handleCloseNewSubmission = () => setShowNewSubmissionDialog(false);
  const handleNewSubmission = () => {
    setShowNewSubmissionDialog(false);
    toast.success('Successfully made a new submission');
    navigate('/dashboard');
  };

  const handleDownloadInitialConfig = () => {
    const link = document.createElement('a');
    link.href = selectedProblem!.initialConfigLink;
    link.click();
  };

  const initialCanvasExists =
    selectedProblem?.canvasLink.length && selectedProblem.canvasLink.length > 3;

  return (
    <Box component='div' className={classes.mainContainer}>
      <Loading open={loading} />
      <AppHeader />
      <NewSubmission
        open={showNewSubmissionDialog}
        onClose={handleCloseNewSubmission}
        onSubmit={handleNewSubmission}
        problemID={selectedProblem?.id.toString()}
      />
      <Box component='div' className={classes.problemsContainer}>
        <Box component='div' className={classes.row}>
          <Box component='div' className={classes.selectProblem}>
            <FormControl fullWidth>
              <InputLabel id='select-problem-label'>Select Problem</InputLabel>
              <Select
                labelId='select-problem-label'
                id='select-problem'
                label='Select Problem'
                value={selectedProblem?.id ?? 1}
                onChange={handleChangeSelectedProblem}
                size='small'
              >
                {problems.map((problem) => (
                  <MenuItem value={problem.id}>{problem.id}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box component='div' className={classes.horizontalSpacer} />
          <Button
            variant='contained'
            startIcon={<NoteAddIcon />}
            disabled={!selectedProblem}
            style={{ ...sharedStyles.buttonText }}
            onClick={handleClickNewSubmission}
          >
            New Submission
          </Button>
        </Box>
        {!!selectedProblem && (
          <Box component='div' className={classes.gridContainer}>
            <Grid container spacing={1.5}>
              <Grid item xs={12}>
                <Box
                  component='div'
                  style={{ ...sharedStyles.h6, fontSize: 18 }}
                >
                  {selectedProblem.name}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box component='div' style={{ ...sharedStyles.body1 }}>
                  {selectedProblem.description}
                </Box>
              </Grid>
              <Grid item xs={initialCanvasExists ? 2 : 4} />
              {initialCanvasExists && (
                <Grid item xs={4}>
                  <Box
                    component='div'
                    style={{ ...sharedStyles.h6 }}
                    className={classes.imageTitle}
                  >
                    Initial Canvas
                  </Box>
                </Grid>
              )}
              <Grid item xs={4}>
                <Box
                  component='div'
                  style={{ ...sharedStyles.h6 }}
                  className={classes.imageTitle}
                >
                  Target
                </Box>
              </Grid>
              <Grid item xs={initialCanvasExists ? 2 : 4} />
              <Grid item xs={initialCanvasExists ? 2 : 4} />
              {initialCanvasExists && (
                <Grid item xs={4}>
                  <Box
                    component='img'
                    src={selectedProblem.canvasLink}
                    className={classes.image}
                  />
                </Grid>
              )}
              <Grid item xs={4}>
                <Box
                  component='img'
                  src={selectedProblem.targetLink}
                  className={classes.image}
                />
              </Grid>
              <Grid item xs={12}>
                <Box
                  component='div'
                  className={classes.downloadButtonContainer}
                >
                  {
                    // TODO: Remove this short circuit
                    selectedProblem?.initialConfigLink && selectedProblem?.initialConfigLink !== ' ' && (
                      <Button
                        onClick={handleDownloadInitialConfig}
                        color='primary'
                        style={{ ...sharedStyles.buttonText }}
                        endIcon={<DownloadIcon />}
                      >
                        Download initial config
                      </Button>
                    )
                  }
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
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
  problemsContainer: {
    padding: theme.spacing(1.5),
    flexGrow: 1,
  },
  selectProblem: {
    marginTop: 'auto',
    marginBottom: 'auto',
    display: 'flex',
    minWidth: 150,
  },
  row: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'row',
  },
  horizontalSpacer: {
    flexGrow: 1,
  },
  gridContainer: {
    marginTop: theme.spacing(1.5),
    display: 'flex',
    flexGrow: 1,
  },
  imageTitle: {
    flexGrow: 1,
    textAlign: 'center',
  },
  image: {
    flexGrow: 1,
    border: 'groove',
    width: '100%',
    aspectRatio: '1 / 1',
  },
  downloadButtonContainer: {
    flexGrow: 1,
    textAlign: 'center',
  },
}));

export default Problems;
