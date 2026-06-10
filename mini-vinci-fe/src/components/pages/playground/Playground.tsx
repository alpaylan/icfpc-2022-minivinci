import { Box, Button, TextareaAutosize, Theme } from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { makeStyles } from 'tss-react/mui';
import { useSetRecoilState } from 'recoil';
import { useEffect, useRef, useState } from 'react';
import { selectedTab as selectedTabAtom } from '../../../atoms/tabs';
import AppHeader from '../../AppHeader';
import { TabKind } from '../../../variables/tabs';
import { sharedColors, sharedStyles } from '../../../utilities/styles';
import { Canvas } from '../../../contest-logic/Canvas';
import { RGBA } from '../../../contest-logic/Color';
import { Interpreter } from '../../../contest-logic/Interpreter';
import { instructionToString } from '../../../contest-logic/Instruction';
import { Painter } from '../../../contest-logic/Painter';
import { RandomInstructionGenerator } from '../../../contest-logic/RandomInstructionGenerator';

const Playground = (): JSX.Element => {
  const { classes } = useStyles();
  const [playgroundCode, setPlaygroundCode] = useState('');
  const [paintedCanvas, setPaintedCanvas] = useState(
    new Canvas(400, 400, new RGBA([255, 255, 255, 255])),
  );
  const [canvasDrawn, setCanvasDrawn] = useState(false);
  const setSelectedTab = useSetRecoilState(selectedTabAtom);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handlePlaygroundCode = (e: any) => {
    setPlaygroundCode(e.target.value as string);
    setCanvasDrawn(false);
    clearCanvas();
  };
  const handleClickGenerateInstruction = () => {
    const interpreter = new Interpreter();
    const instruction =
      RandomInstructionGenerator.generateRandomInstruction(paintedCanvas);
    const result = interpreter.interpret(0, paintedCanvas, instruction, 0);
    setPlaygroundCode(`${playgroundCode}\n${instructionToString(instruction)}`);
    setPaintedCanvas(result.canvas);
    setCanvasDrawn(true);
  };

  const drawToCanvas = () => {
    const painter = new Painter();
    const renderedData = painter.draw(paintedCanvas);
    const canvas = canvasRef.current!;
    const context = canvas.getContext('2d')!;

    canvas.width = paintedCanvas.width;
    canvas.height = paintedCanvas.height;
    const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    renderedData.forEach((pixel: RGBA, index: number) => {
      imgData.data[index * 4] = pixel.r;
      imgData.data[index * 4 + 1] = pixel.g;
      imgData.data[index * 4 + 2] = pixel.b;
      imgData.data[index * 4 + 3] = pixel.a;
    });
    context.putImageData(imgData, 0, 0);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext('2d')!;

    canvas.width = paintedCanvas.width;
    canvas.height = paintedCanvas.height;
    const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    imgData.data.forEach((value, index) => {
      imgData.data[index] = 255;
    });
  };
  const handleClickRenderCanvas = () => {
    if (canvasDrawn) {
      drawToCanvas();
    } else {
      const interpreter = new Interpreter();
      const result = interpreter.run(playgroundCode);
      setPaintedCanvas(result.canvas);
      setCanvasDrawn(true);
    }
  };
  const handleReset = () => {
    setPaintedCanvas(new Canvas(400, 400, new RGBA([255, 255, 255, 255])));
    setPlaygroundCode('');
    clearCanvas();
  };
  // The playground is a fully client-side tool and needs no authentication.
  useEffect(() => {
    setSelectedTab(TabKind.PLAYGROUND);
    document.title = 'ICFPC 2022 Playground';
  }, []);

  return (
    <Box component='div' className={classes.mainContainer}>
      <AppHeader />
      <Box component='div' className={classes.headerRow}>
        <Box className={classes.submissionsHeader}>Playground</Box>
        <Box component='div' className={classes.horizontalSpacer} />
        <Button
          variant='contained'
          startIcon={<NoteAddIcon />}
          style={{ ...sharedStyles.buttonText }}
          onClick={handleClickGenerateInstruction}
        >
          Generate Instruction
        </Button>
        <Button
          variant='contained'
          startIcon={<NoteAddIcon />}
          style={{ ...sharedStyles.buttonText }}
          onClick={handleClickRenderCanvas}
        >
          Render Canvas
        </Button>
        <Button
          variant='contained'
          startIcon={<NoteAddIcon />}
          style={{ ...sharedStyles.buttonText }}
          onClick={handleReset}
        >
          Reset
        </Button>
      </Box>
      <Box component='div' className={classes.row}>
        <TextareaAutosize
          placeholder='Code to be submitted'
          value={playgroundCode}
          onChange={handlePlaygroundCode}
          className={classes.textArea}
        />
        <Box component='div' className={classes.canvasContainer}>
          <canvas ref={canvasRef} />
        </Box>
      </Box>
    </Box>
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
  textArea: {
    marginTop: theme.spacing(1.5),
    flexGrow: 1,
    display: 'flex',
    maxWidth: '45%',
    marginLeft: theme.spacing(1),
    minHeight: 50,
  },
  canvasContainer: {
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
    marginRight: 'auto',
    marginLeft: theme.spacing(1),
    width: '45%',
    border: 'groove',
  },
  row: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'row',
  },
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

export default Playground;
