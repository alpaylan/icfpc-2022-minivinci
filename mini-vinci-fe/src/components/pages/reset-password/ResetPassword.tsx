import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Grid, Paper, Theme } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useEffect, useMemo, useState } from 'react';
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';
import { toast } from 'material-react-toastify';
import logo from '../../../assets/headerLogo.png';
import Loading from '../../Loading';
import { renewPassword } from '../../../services/auth';

const ResetPassword = (): JSX.Element => {
  const { classes } = useStyles();

  const navigate = useNavigate();

  const useQuery = () => {
    const { search } = useLocation();

    return useMemo(() => new URLSearchParams(search), [search]);
  };

  const query = useQuery();
  const token = query.get('token');

  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    ValidatorForm.addValidationRule(
      'noWhiteSpace',
      (value: string) => !value.includes(' '),
    );
  }, []);

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

  const handleSubmit = () => {
    setLoading(true);
    renewPassword(password, token ?? '')
      .then(() => navigate('/login'))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  const requiredMessage = 'This field is required';
  const passwordLengthMessage = 'Minimum 6 characters';
  const noWhiteSpaceMessage = 'Whitespace not allowed';
  const passwordMatchMessage = 'Passwords should match';

  return (
    <Box component='div' className={classes.background}>
      <Loading open={loading} />
      <Paper className={classes.paper}>
        <Box component='div' className={classes.logoContainer}>
          <img src={logo} alt='' width={150} />
        </Box>
        <ValidatorForm
          instantValidate
          onError={(errors) => toast.error(errors)}
          onSubmit={handleSubmit}
        >
          <Box component='div' className={classes.gridContainer}>
            <Grid container spacing={1.5}>
              <Grid item xs={12}>
                <TextValidator
                  name='password'
                  label='New Password'
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
                    Reset Password
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
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
    flexGrow: 1,
    justifyContent: 'center',
  },
}));

export default ResetPassword;
