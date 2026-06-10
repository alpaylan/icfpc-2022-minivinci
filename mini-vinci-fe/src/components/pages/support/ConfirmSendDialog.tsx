import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Theme,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { sharedStyles } from '../../../utilities/styles';

interface ConfirmSendDialogProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmSendDialog = (props: ConfirmSendDialogProps): JSX.Element => {
  const { classes } = useStyles();

  return (
    <Dialog open={props.open} maxWidth='sm' onClose={props.onClose}>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogContent>
        <Box>You are sending following message:</Box>
        <Box className={classes.message}>{props.message}</Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={props.onClose}
          color='primary'
          style={{ ...sharedStyles.buttonText }}
        >
          Cancel
        </Button>
        <Button
          onClick={props.onConfirm}
          color='primary'
          style={{ ...sharedStyles.buttonText }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const useStyles = makeStyles()((theme: Theme) => ({
  message: {
    fontStyle: 'italic',
    marginTop: theme.spacing(1.5),
  },
}));

export default ConfirmSendDialog;
