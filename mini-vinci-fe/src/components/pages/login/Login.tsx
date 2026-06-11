import { Box, Button, Grid, Paper, Theme, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import { makeStyles } from 'tss-react/mui';
import { useEffect, useState } from 'react';
import { toast } from 'material-react-toastify';
import { useRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { authToken as authTokenAtom } from '../../../atoms/auth';
import headerLogo from '../../../assets/headerLogo.png';
import { login, register } from '../../../services/auth';
import Loading from '../../Loading';
import {
  isAuthTokenExpired,
  updateAuthTokenInStorage,
} from '../../../utilities/auth';

const Login = (): JSX.Element => {
  const { classes } = useStyles();

  const navigate = useNavigate();

  const [authToken, setAuthToken] = useRecoilState(authTokenAtom);

  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    if (!isAuthTokenExpired(authToken)) {
      navigate('/dashboard');
    }
  }, [authToken]);

  useEffect(() => {
    ValidatorForm.addValidationRule(
      'noWhiteSpace',
      (value: string) => !value.includes(' '),
    );
    ValidatorForm.addValidationRule(
      'teamNameLength',
      (value: string) => value.trim().length > 2,
    );
  }, []);

  useEffect(() => {
    document.title = isRegistering ? 'Register' : 'Login';
  }, [isRegistering]);

  const handleChangeEmail = (e: any) => setEmail(e.target.value as string);
  const handleChangePassword = (e: any) => {
    ValidatorForm.removeValidationRule(`passwordMatch${password}`);
    setConfirmPassword('');
    const newPassword = e.target.value as string;
    setPassword(newPassword);
    ValidatorForm.addValidationRule(
      `passwordMatch${newPassword}`,
      (value: string) => {
        return value === newPassword;
      },
    );
  };
  const handleChangeConfirmPassword = (e: any) =>
    setConfirmPassword(e.target.value as string);
  const handleChangeTeamName = (e: any) =>
    setTeamName(e.target.value as string);
  const handleToggleRegister = () => setIsRegistering(!isRegistering);

  const handleSubmit = () => {
    setLoading(true);
    if (isRegistering) {
      // Accounts are auto-verified (the email step was removed), so register
      // and sign the user in straight away.
      register(email, password, teamName)
        .then(() => login(email, password))
        .then((token) => {
          setAuthToken(token);
          updateAuthTokenInStorage(token);
          toast.success('Account created — you are now signed in');
        })
        .catch((err) => toast.error(err.message))
        .finally(() => setLoading(false));
    } else {
      login(email, password)
        .then((token) => {
          setAuthToken(token);
          updateAuthTokenInStorage(token);
        })
        .catch((err) => toast.error(err.message))
        .finally(() => setLoading(false));
    }
  };

  const requiredMessage = 'This field is required';
  const isEmailMessage = 'Invalid email';
  const passwordLengthMessage = 'Minimum 6 characters';
  const noWhiteSpaceMessage = 'Whitespace not allowed';
  const passwordMatchMessage = 'Passwords should match';
  const teamNameLengthMessage = 'At least 3 characters (except spaces)';
  const alphanumericTeamNameMessage = 'Only alphanumeric characters or "_"';

  const generateLoginRegisterForm = () => (
    <Box component='div' className={classes.gridContainer}>
      <Grid container spacing={1.5}>
        <Grid item xs={12}>
          <TextValidator
            name='email'
            label='Email'
            onChange={handleChangeEmail}
            value={email}
            validators={['required', 'isEmail']}
            errorMessages={[requiredMessage, isEmailMessage]}
            size='small'
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextValidator
            name='password'
            label='Password'
            onChange={handleChangePassword}
            value={password}
            validators={['required', 'minStringLength:6', 'noWhiteSpace']}
            errorMessages={[
              requiredMessage,
              passwordLengthMessage,
              noWhiteSpaceMessage,
            ]}
            size='small'
            fullWidth
            type='password'
          />
        </Grid>
        {isRegistering && (
          <Grid item xs={12}>
            <TextValidator
              name='confirm'
              label='Confirm Password'
              onChange={handleChangeConfirmPassword}
              value={confirmPassword}
              validators={['required', `passwordMatch${password}`]}
              errorMessages={[requiredMessage, passwordMatchMessage]}
              size='small'
              fullWidth
              type='password'
            />
          </Grid>
        )}
        {isRegistering && (
          <Grid item xs={12}>
            <TextValidator
              name='teamName'
              label='Team Name'
              onChange={handleChangeTeamName}
              value={teamName}
              validators={[
                'required',
                'teamNameLength',
                'matchRegexp:^[a-zA-Z0-9_\\s]+$',
              ]}
              errorMessages={[
                requiredMessage,
                teamNameLengthMessage,
                alphanumericTeamNameMessage,
              ]}
              size='small'
              fullWidth
            />
          </Grid>
        )}
        <Grid item xs={3}>
          <Box component='div' />
        </Grid>
        <Grid item xs={6}>
          <Box component='div' className={classes.submitButtonContainer}>
            <Button
              variant='contained'
              color='primary'
              type='submit'
              style={{ textTransform: 'none' }}
            >
              {isRegistering ? 'Sign Up' : 'Sign In'}
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box component='div' className={classes.typographyContainer}>
            <Typography className={classes.optionTypography}>
              {isRegistering ? 'Already registered?' : 'Not registered yet?'}
              <Box component='div' className={classes.horizontalSpacer} />
              <Button
                style={{ textTransform: 'none', padding: 0 }}
                endIcon={<ChevronRightIcon fontSize='small' />}
                onClick={handleToggleRegister}
              >
                {`${isRegistering ? 'Sign In' : 'Sign Up'} instead`}
              </Button>
            </Typography>
            <Typography className={classes.optionTypography}>
              Just looking around?
              <Box component='div' className={classes.horizontalSpacer} />
              <Button
                style={{ textTransform: 'none', padding: 0 }}
                endIcon={<ChevronRightIcon fontSize='small' />}
                onClick={() => navigate('/problems')}
              >
                Browse without signing in
              </Button>
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
  return (
    <Box component='div' className={classes.background}>
      <Loading open={loading} />
      <Paper className={classes.paper}>
        <Box component='div' className={classes.logoContainer}>
          <img src={headerLogo} alt='' width={150} />
        </Box>
        <ValidatorForm
          instantValidate
          onError={(errors) => toast.error(errors)}
          onSubmit={handleSubmit}
        >
          {generateLoginRegisterForm()}
        </ValidatorForm>
      </Paper>
    </Box>
  );
};

const useStyles = makeStyles()((theme: Theme) => ({
  background: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'row',
    height: '70vh',
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    margin: 'auto',
    height: 'fit-content',
    alignContent: 'center',
    width: 290,
  },
  logoContainer: {
    flexGrow: 1,
    textAlign: 'center',
    marginTop: theme.spacing(-2),
    alignContent: 'center',
  },
  gridContainer: {
    flexGrow: 1,
  },
  submitButtonContainer: {
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'center',
  },
  typographyContainer: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'center',
  },
  optionTypography: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'row',
  },
  horizontalSpacer: {
    flexGrow: 1,
  },
}));

export default Login;
