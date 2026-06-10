import { Box, Paper, Theme } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { SupportMessage } from '../../../models/support';
import { formatToLocalDateTime } from '../../../utilities/time';
import { sharedColors, sharedStyles } from '../../../utilities/styles';

interface MessagePaperProps {
  supportMessage: SupportMessage;
  teamName: string;
}

const MessagePaper = (props: MessagePaperProps): JSX.Element => {
  const { classes } = useStyles();

  const sender = props.supportMessage.isAnswer
    ? 'Support Team'
    : props.teamName;

  return (
    <Paper
      style={{
        backgroundColor: props.supportMessage.isAnswer
          ? sharedColors.gray1
          : sharedColors.statusGreenLightest,
      }}
      className={classes.paper}
    >
      <Box
        component='div'
        style={{ ...sharedStyles.caption }}
        className={classes.description}
      >
        {`On ${formatToLocalDateTime(
          props.supportMessage.time,
        )} ${sender} wrote:`}
      </Box>
      <Box component='div' style={{ ...sharedStyles.body1 }}>
        {props.supportMessage.message}
      </Box>
    </Paper>
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
}));

export default MessagePaper;
