import {
  Box, Button,
  Theme,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useEffect, useState } from 'react';
import { DropzoneArea } from 'react-mui-dropzone';
import { toast } from 'material-react-toastify';
import { selectedTab as selectedTabAtom } from '../../../atoms/tabs';
import { sharedColors, sharedStyles } from '../../../utilities/styles';
import {
  getAuthTokenFromStorage,
  isAuthTokenExpired,
} from '../../../utilities/auth';
import { TabKind } from '../../../variables/tabs';
import AppHeader from '../../AppHeader';
import { authToken as authTokenAtom } from '../../../atoms/auth';
import { uploadSourceCode } from '../../../services/sourcecode';
import Loading from '../../Loading';

const SourceCode = (): JSX.Element => {
  const { classes } = useStyles();

  const navigate = useNavigate();

  const [authToken, setAuthToken] = useRecoilState(authTokenAtom);
  const setSelectedTab = useSetRecoilState(selectedTabAtom);

  const [submittedFile, setSubmittedFile ] = useState<File | null>(null);

  const [uploadInfo, setUploadInfo] = useState('Please upload your file below.');

  const [loading, setLoading] = useState(false);

  const initializeTokenFromStorage = () => {
    const storedAuthToken = getAuthTokenFromStorage();
    if (isAuthTokenExpired(storedAuthToken)) {
      navigate('/login');
    } else {
      setAuthToken(storedAuthToken);
    }
  };

  const handleUploadFile = (fileList: File[]) => setSubmittedFile(fileList[0]);

  const handleSubmit = () => {
    setLoading(true);
    uploadSourceCode(submittedFile, authToken!)
      .then((fetchedUploadSourceCodeResponse) => {
        toast.success('You successfully uploaded!');
        setUploadInfo(`Successfully uploaded! MD5 Checksum of Uploaded File: ${  fetchedUploadSourceCodeResponse.md5}`);
      })
      .catch((err) => {
        toast.error(err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    initializeTokenFromStorage();
    setSelectedTab(TabKind.SOURCECODE);
    document.title = 'ICFPC 2022 Source Code';
  }, []);

  return (
    <Box component='div' className={classes.mainContainer}>
      <Loading open={loading} />
      <AppHeader />
      <Box component='div' className={classes.headerRow}>
        <Box className={classes.sourcecodeHeader}>Upload Your Source Codes</Box>
      </Box>
      <Box component='div' className={classes.sourceCodeAnnouncement}>
        { 'We expect you to submit your codes within the next 24 hours following the contest in order to verify the authenticity of your code, those who do not submit their codes will not be eligible for prizes.' }
      </Box>
      <Box component='div' className={classes.sourceCodeAnnouncement}>
        { 'You will submit your code as a zip file, upper limit is 64mb for file size. If that does not suit your needs, please reach us via email or discord. It’s enough to submit your code only once. If you think there might be a problem with your source code submission, reach us via email or discord.' }
      </Box>
      <Box component='div' className={classes.uploadedInfo}>
        { uploadInfo }
      </Box>
      <Box component='div' className={classes.headerRow}>
          <DropzoneArea
              dropzoneClass={classes.dropzone}
              filesLimit={1}
              maxFileSize={67108864}
              acceptedFiles={['.zip']}
              showFileNames
              onChange={handleUploadFile}
          />
      </Box>
      <Box component='div' className={classes.horizontalSpacer} />
      <Button
          color='primary'
          disabled={!submittedFile}
          onClick={() => {
            handleSubmit();
          }}
      >
        Submit
      </Button>
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
  sourcecodeHeader: {
    ...sharedStyles.h6,
    fontSize: 18,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  sourceCodeAnnouncement: {
    ...sharedStyles.h2,
    marginLeft: theme.spacing(3),
    marginTop: theme.spacing(1),
  },
  uploadedInfo: {
    ...sharedStyles.h2Bold,
    marginLeft: theme.spacing(3),
    marginTop: theme.spacing(1),
  },
  horizontalSpacer: {
    flexGrow: 1,
  },
  dropzone: {
    padding: theme.spacing(2),
    minHeight: '100px',
    backgroundColor: sharedColors.gray2,
    border: 'dashed',
    borderColor: sharedColors.gray3,
    cursor: 'pointer',
    maxWidth: '100%',
    marginBottom: theme.spacing(2),
  },
}));

export default SourceCode;
