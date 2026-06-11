import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextareaAutosize,
  Theme,
} from '@mui/material';

import axios from 'axios';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import HelpIcon from '@mui/icons-material/Help';
import { makeStyles } from 'tss-react/mui';
import { useEffect, useRef, useState } from 'react';
import { DropzoneArea } from 'react-mui-dropzone';
import { toast } from 'material-react-toastify';
import { useRecoilValue } from 'recoil';
import { authToken as authTokenAtom } from '../atoms/auth';
import { sharedColors, sharedStyles } from '../utilities/styles';
import Loading from './Loading';
import { makeNewSubmission } from '../services/submission';
import { getPreviewImageName } from '../utilities/submission';
import { Interpreter, InterpreterResult } from '../contest-logic/Interpreter';
import { RGBA } from '../contest-logic/Color';
import { Painter } from '../contest-logic/Painter';
import { SimilarityChecker } from '../contest-logic/SimilarityChecker';
import { Problem } from '../models/problem';
import { getProblems } from '../services/problem';
import config from '../config';

interface NewSubmissionProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  problemID?: string;
}

enum SubmissionPhase {
  ENTER_CODE,
  TYPE_CHECK,
  READY_TO_SUBMIT,
  RENDER,
  UPLOAD,
}

const NewSubmission = (props: NewSubmissionProps): JSX.Element => {
  const { classes } = useStyles();

  const authToken = useRecoilValue(authTokenAtom);
  const [loading, setLoading] = useState(false);
  const [submittedFile, setSubmittedFile] = useState<File | null>(null);
  const [interpreterResult, setInterpreterResult] = useState(
    undefined as InterpreterResult | undefined,
  );
  const [codeToSubmit, setCodeToSubmit] = useState('');
  const [submissionPhase, setSubmissionPhase] = useState(
    SubmissionPhase.ENTER_CODE,
  );
  const [isRendered, setIsRendered] = useState(false);
  const [problemID, setProblemID] = useState(props.problemID);
  const [problems, setProblems] = useState([] as Problem[]);

  const [proposedScore, setProposedScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [targetPaintingData, setTargetPaintingData] = useState(undefined);
  const [initialConfigData, setInitialConfigData] = useState(undefined);

  const refreshProblems = () => {
    setLoading(true);
    getProblems(authToken!)
      .then((problemsList) => {
        setProblems(problemsList);
        if (problemsList.length > 0) {
          setProblemID(problemsList[0].id.toString());
        }
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    (async () => {
      if (problemID) {
        const targetPaintingDataResponse = await axios.get(
          `${config.ASSETS_BASE_URL}/imageframes/${problemID}.json`,
        );

        setTargetPaintingData(targetPaintingDataResponse.data);

        try {
          const initialConfigDataResponse = await axios.get(
            `${config.ASSETS_BASE_URL}/imageframes/${problemID}.initial.json`,
          );

          try {
            if (initialConfigDataResponse.data.sourcePngJSON) {
              initialConfigDataResponse.data.sourcePngData = (await axios.get(
                initialConfigDataResponse.data.sourcePngJSON,
              )).data;
            }
          } catch { /* sourcePng data is optional */ }

          setInitialConfigData(initialConfigDataResponse.data);
        } catch {
          setInitialConfigData(undefined);
        }
      }
    })();
  }, [problemID]);

  const interpret = (fileContent: string) => {
    const interpreter = new Interpreter();
    if (initialConfigData) {
      return interpreter.run_with_config(fileContent, initialConfigData, Number(problemID));
    }

    return interpreter.run(fileContent);
  };

  const drawToCanvas = async (canvasToDraw: InterpreterResult) => {
    if (targetPaintingData) {
      const interpretedCanvas = canvasToDraw.canvas;
      const instructionCost = canvasToDraw.cost;
      const painter = new Painter();
      const renderedData = painter.draw(interpretedCanvas);

      const targetPainting = SimilarityChecker.dataToFrame(targetPaintingData);
      const similarityCost = SimilarityChecker.imageDiff(
        targetPainting,
        renderedData,
      );
      const canvas = canvasRef.current!;
      const context = canvas.getContext('2d')!;

      canvas.width = interpretedCanvas.width;
      canvas.height = interpretedCanvas.height;

      const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
      renderedData.forEach((pixel: RGBA, index: number) => {
        imgData.data[index * 4] = pixel.r;
        imgData.data[index * 4 + 1] = pixel.g;
        imgData.data[index * 4 + 2] = pixel.b;
        imgData.data[index * 4 + 3] = pixel.a;
      });
      context.putImageData(imgData, 0, 0);

      // TODO: This should also have the similarity cost added to it.
      return instructionCost + similarityCost;
    }

    return 0;
  };

  useEffect(() => {
    setIsRendered(false);
    setSubmissionPhase(SubmissionPhase.ENTER_CODE);
    if (props.open) {
      if (props.problemID) {
        setProblemID(props.problemID);
      } else {
        refreshProblems();
      }
    }
  }, [props.open]);

  useEffect(() => {
    if (submittedFile) {
      const reader = new FileReader();
      reader.readAsText(submittedFile);
      reader.onload = () => {
        setCodeToSubmit(reader.result as string);
      };
      reader.onerror = () => toast.error('Could not read the uploaded file');
    } else {
      setCodeToSubmit('');
    }
  }, [submittedFile]);

  const handleChangeProblemID = (e: any) => {
    setProblemID(e.target.value as string);
  };

  const handleUploadFile = (fileList: File[]) => setSubmittedFile(fileList[0]);
  const handleChangeCodeToSubmit = (e: any) => {
    setCodeToSubmit(e.target.value as string);
    setSubmissionPhase(SubmissionPhase.ENTER_CODE);
    setIsRendered(false);
  };

  const handleSubmit = () => {
    setLoading(true);
    makeNewSubmission(problemID!, codeToSubmit, authToken!)
      .then(props.onSubmit)
      .catch((err) => {
        toast.error(err.message);
        setSubmissionPhase(SubmissionPhase.READY_TO_SUBMIT);
      })
      .finally(() => setLoading(false));
  };

  const handlePreview = () => {
    setLoading(true);
    setSubmissionPhase(SubmissionPhase.RENDER);
    setIsRendered(true);

    setTimeout(async () => {
      try {
        setProposedScore(
          await drawToCanvas(interpreterResult as InterpreterResult),
        );
        setSubmissionPhase(SubmissionPhase.READY_TO_SUBMIT);
      } catch (err: any) {
        toast.error(err.message);
        setSubmissionPhase(SubmissionPhase.ENTER_CODE);
        setIsRendered(false);
      } finally {
        setLoading(false);
      }
    }, 3000);
  };
  const handleTypeCheck = () => {
    setLoading(true);
    setSubmissionPhase(SubmissionPhase.TYPE_CHECK);
    setTimeout(() => {
      try {
        setInterpreterResult(interpret(codeToSubmit));
        setSubmissionPhase(SubmissionPhase.READY_TO_SUBMIT);
      } catch (err: any) {
        toast.error(err.message);
        setSubmissionPhase(SubmissionPhase.ENTER_CODE);
        setIsRendered(false);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleDownloadCanvas = () => {
    const canvas = canvasRef.current!;
    const link = document.createElement('a');
    link.download = getPreviewImageName();
    link.href = canvas.toDataURL();
    link.click();
  };

  const getRenderIcon = () => {
    if (submissionPhase === SubmissionPhase.RENDER) {
      return (
        <HourglassEmptyIcon
          style={{
            fontSize: 28,
            color: sharedColors.stepIconDisabled,
          }}
          className={classes.stepIcon}
        />
      );
    }
    return isRendered ? (
      <CheckCircleIcon
        style={{
          fontSize: 28,
          color: sharedColors.statusGreen,
        }}
        className={classes.stepIcon}
      />
    ) : (
      <HelpIcon
        style={{
          fontSize: 28,
          color: sharedColors.stepIconDisabled,
        }}
        className={classes.stepIcon}
      />
    );
  };

  const getNextButtonByPhase = () => {
    switch (submissionPhase) {
      case SubmissionPhase.ENTER_CODE:
        return (
          <Button
            color='primary'
            onClick={() => {
              setLoading(true);
              setSubmissionPhase(SubmissionPhase.TYPE_CHECK);
              handleTypeCheck();
            }}
            disabled={codeToSubmit === ''}
          >
            Next
          </Button>
        );
      case SubmissionPhase.READY_TO_SUBMIT:
        return (
          <Button
            color='primary'
            disabled={!problemID}
            onClick={() => {
              setSubmissionPhase(SubmissionPhase.UPLOAD);
              handleSubmit();
            }}
          >
            Submit
          </Button>
        );
      default:
        return (
          <Button color='primary' disabled>
            Next
          </Button>
        );
    }
  };

  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth>
      <Loading open={loading} />
      <DialogTitle>
        <Box component='div' className={classes.row}>
          <Box
            component='div'
            style={{ ...sharedStyles.h6, fontSize: 20 }}
            className={classes.title}
          >
            {`New Submission for Problem ${props.problemID ?? ''}`}
          </Box>
          {!props.problemID && (
            <Box component='div' className={classes.selectProblem}>
              <FormControl variant='standard'>
                <Select
                  labelId='problem-to-submit'
                  id='select-problem-to-submit'
                  value={problemID}
                  onChange={handleChangeProblemID}
                  disabled={!!props.problemID}
                  size='small'
                >
                  {problems.map((problem) => (
                    <MenuItem value={problem.id.toString()}>
                      {problem.id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box component='div' className={classes.contentWrapper}>
          <FormControl
            component='fieldset'
            className={classes.dropzoneContainer}
          >
            <DropzoneArea
              dropzoneClass={classes.dropzone}
              filesLimit={1}
              maxFileSize={33554432}
              acceptedFiles={['']}
              showFileNames
              onChange={handleUploadFile}
            />
          </FormControl>
          <Box component='div' className={classes.stepperContainer}>
            <Stepper activeStep={submissionPhase} alternativeLabel>
              <Step>
                <StepLabel>Enter Code</StepLabel>
              </Step>
              <Step>
                <StepLabel>Type Check</StepLabel>
              </Step>
              <Step>
                <StepLabel>Ready To Submit</StepLabel>
              </Step>
              <Step>
                <StepLabel icon={getRenderIcon()}>
                  Rendering
                  <br />
                  (Optional)
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>Uploading</StepLabel>
              </Step>
            </Stepper>
          </Box>
          {isRendered && (
            <Box component='div'>
              <Box component='div' className={classes.canvasContainer}>
                <canvas ref={canvasRef} />
              </Box>
              <Box component='div' className={classes.row}>
                <Box component='div' className={classes.scoreLabel}>
                  Proposed Score:
                </Box>
                <Box component='div' className={classes.scoreValue}>
                  {proposedScore}
                </Box>
                <Box component='div' className={classes.horizontalSpacer} />
                <Button
                  color='primary'
                  onClick={handleDownloadCanvas}
                  endIcon={<DownloadIcon />}
                >
                  Download
                </Button>
              </Box>
            </Box>
          )}
          <TextareaAutosize
            placeholder='Code to be submitted'
            disabled={
              submissionPhase !== SubmissionPhase.ENTER_CODE &&
              submissionPhase !== SubmissionPhase.READY_TO_SUBMIT
            }
            value={codeToSubmit}
            onChange={handleChangeCodeToSubmit}
            className={classes.textArea}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color='primary' onClick={props.onClose}>
          Close
        </Button>
        {submissionPhase === SubmissionPhase.READY_TO_SUBMIT && !isRendered && (
          <Button color='primary' onClick={handlePreview}>
            Preview
          </Button>
        )}
        {getNextButtonByPhase()}
      </DialogActions>
    </Dialog>
  );
};

const useStyles = makeStyles()((theme: Theme) => ({
  contentWrapper: {
    padding: theme.spacing(1),
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  dropzoneContainer: {
    display: 'flex',
    marginRight: 'auto',
    marginLeft: 'auto',
    flexGrow: 1,
  },
  dropzone: {
    position: 'relative',
    padding: theme.spacing(2),
    minHeight: '100px',
    backgroundColor: sharedColors.gray2,
    border: 'dashed',
    borderColor: sharedColors.gray3,
    cursor: 'pointer',
  },
  canvasContainer: {
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
    marginRight: 'auto',
    marginLeft: 'auto',
    maxWidth: 500,
    maxHeight: 500,
    border: 'groove',
  },
  stepperContainer: {
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(0.5),
    flexGrow: 1,
  },
  stepIcon: {
    marginTop: theme.spacing(-0.25),
    marginBottom: theme.spacing(-0.25),
  },
  textArea: {
    marginTop: theme.spacing(1.5),
    flexGrow: 1,
    display: 'flex',
    minHeight: 50,
  },
  row: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'row',
  },
  scoreLabel: {
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: 500,
    fontSize: '18px',
    lineHeight: '16px',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  scoreValue: {
    marginLeft: theme.spacing(1),
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '18px',
    lineHeight: '16px',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  horizontalSpacer: {
    flexGrow: 1,
  },
  selectProblem: {
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  title: {
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(1),
  },
}));

export default NewSubmission;
