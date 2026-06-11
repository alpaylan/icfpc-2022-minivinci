import { Box, Button, TextareaAutosize, Theme } from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { makeStyles } from 'tss-react/mui';
import { useSetRecoilState } from 'recoil';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'material-react-toastify';
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

const newBlankCanvas = (): Canvas =>
  new Canvas(400, 400, new RGBA([255, 255, 255, 255]));

// A small, easy-to-explain starter program: point-cut the canvas into four
// corner blocks and paint each one a different color.
const EXAMPLE_CODE = `# Welcome to the mini-vinci playground!
# Write ISL (the contest's Instruction Set Language) to paint the canvas,
# then press "Render Canvas".
#
# This example cuts the canvas into 4 corners and paints each one.
cut [0] [200, 200]
color [0.0] [237, 28, 36, 255]
color [0.1] [255, 242, 0, 255]
color [0.2] [0, 162, 232, 255]
color [0.3] [34, 177, 76, 255]`;

const Playground = (): JSX.Element => {
  const { classes } = useStyles();
  const [playgroundCode, setPlaygroundCode] = useState(EXAMPLE_CODE);
  const [paintedCanvas, setPaintedCanvas] = useState(newBlankCanvas());
  const setSelectedTab = useSetRecoilState(selectedTabAtom);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawToCanvas = (canvasToDraw: Canvas) => {
    const painter = new Painter();
    const renderedData = painter.draw(canvasToDraw);
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext('2d')!;

    canvas.width = canvasToDraw.width;
    canvas.height = canvasToDraw.height;
    const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    renderedData.forEach((pixel: RGBA, index: number) => {
      imgData.data[index * 4] = pixel.r;
      imgData.data[index * 4 + 1] = pixel.g;
      imgData.data[index * 4 + 2] = pixel.b;
      imgData.data[index * 4 + 3] = pixel.a;
    });
    context.putImageData(imgData, 0, 0);
  };

  // Interpret the code and paint the result in a single step.
  const renderCode = (code: string) => {
    try {
      const interpreter = new Interpreter();
      const result = interpreter.run(code);
      setPaintedCanvas(result.canvas);
      drawToCanvas(result.canvas);
    } catch (err: any) {
      toast.error(err?.message ?? 'Could not interpret the code');
    }
  };

  const handlePlaygroundCode = (e: any) =>
    setPlaygroundCode(e.target.value as string);

  const handleClickGenerateInstruction = () => {
    const interpreter = new Interpreter();
    const instruction =
      RandomInstructionGenerator.generateRandomInstruction(paintedCanvas);
    const result = interpreter.interpret(0, paintedCanvas, instruction, 0);
    setPlaygroundCode(`${playgroundCode}\n${instructionToString(instruction)}`);
    setPaintedCanvas(result.canvas);
    drawToCanvas(result.canvas);
  };

  const handleClickRenderCanvas = () => renderCode(playgroundCode);

  const handleReset = () => {
    setPlaygroundCode('');
    renderCode('');
  };

  // The playground is a fully client-side tool and needs no authentication.
  useEffect(() => {
    setSelectedTab(TabKind.PLAYGROUND);
    document.title = 'ICFPC 2022 Playground';
    // Render the starter example so newcomers see a result immediately.
    renderCode(EXAMPLE_CODE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <Box component='div' className={classes.intro}>
        <Box component='div' style={{ ...sharedStyles.body1 }}>
          The playground runs the contest&apos;s{' '}
          <b>Instruction Set Language (ISL)</b> in your browser. Programs paint a
          400&times;400 canvas &mdash; in the contest the goal is to reproduce a
          target image as cheaply as possible. Edit the code and press{' '}
          <b>Render Canvas</b>.
        </Box>
        <ul className={classes.instructionList}>
          <li>
            <code>cut [b] [x|y] [n]</code> &mdash; split block <code>b</code> with
            a vertical (<code>x</code>) or horizontal (<code>y</code>) line at{' '}
            <code>n</code>
          </li>
          <li>
            <code>cut [b] [x,y]</code> &mdash; split block <code>b</code> into 4
            corners at point <code>(x,y)</code>: <code>b.0</code> bottom-left,{' '}
            <code>b.1</code> bottom-right, <code>b.2</code> top-right,{' '}
            <code>b.3</code> top-left
          </li>
          <li>
            <code>color [b] [r,g,b,a]</code> &mdash; paint block <code>b</code>
          </li>
          <li>
            <code>merge [a] [b]</code> &mdash; merge two blocks;{' '}
            <code>swap [a] [b]</code> &mdash; swap two blocks
          </li>
        </ul>
        <Box component='div' style={{ ...sharedStyles.body1 }}>
          The starter example below cuts the canvas into four corners and paints
          each one.
        </Box>
      </Box>
      <Box component='div' className={classes.row}>
        <TextareaAutosize
          placeholder='Write ISL here, then press Render Canvas'
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
  intro: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    maxWidth: 1000,
  },
  instructionList: {
    ...sharedStyles.body1,
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    lineHeight: 1.9,
    '& code': {
      backgroundColor: '#f0f0f0',
      padding: '1px 5px',
      borderRadius: 3,
      fontSize: '0.92em',
    },
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
