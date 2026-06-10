import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useRecoilValue } from 'recoil';
import { toast } from 'material-react-toastify';
import { authToken as authTokenAtom } from '../../../atoms/auth';

interface ApiKeyDialogProps {
  open: boolean;
  onClose: () => void;
}

const ApiKeyDialog = (props: ApiKeyDialogProps): JSX.Element => {
  const authToken = useRecoilValue(authTokenAtom);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(authToken ?? '')
      .then(() => toast.success('API Key successfully copied to clipboard'))
      .catch((err) => toast.error(err.message));
  };

  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth>
      <DialogTitle>Your API Key</DialogTitle>
      <DialogContent>
        <TextField fullWidth value={authToken} variant='outlined' multiline />
      </DialogContent>
      <DialogActions>
        <Button color='primary' onClick={props.onClose}>
          Close
        </Button>
        <Button color='primary' onClick={handleCopy}>
          Copy to clipboard
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApiKeyDialog;
