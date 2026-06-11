import { Box, Theme } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useSetRecoilState } from 'recoil';
import { useEffect, useState } from 'react';
import { marked } from 'marked';
import { toast } from 'material-react-toastify';
import { selectedTab as selectedTabAtom } from '../../../atoms/tabs';
import AppHeader from '../../AppHeader';
import { TabKind } from '../../../variables/tabs';
import { sharedStyles } from '../../../utilities/styles';

const Specification = (): JSX.Element => {
  const { classes } = useStyles();
  const setSelectedTab = useSetRecoilState(selectedTabAtom);
  const [html, setHtml] = useState('');

  useEffect(() => {
    setSelectedTab(TabKind.SPECIFICATION);
    document.title = 'ICFPC 2022 Specification';
    // The specification is shipped as a static markdown file (own, trusted content).
    fetch('/specification.md')
      .then((res) => res.text())
      .then((text) => setHtml(marked.parse(text) as string))
      .catch(() => toast.error('Could not load the specification'));
  }, [setSelectedTab]);

  return (
    <Box component='div' className={classes.mainContainer}>
      <AppHeader />
      <Box component='div' className={classes.content}>
        <Box component='div' className={classes.header}>
          <Box component='div' className={classes.title}>
            ICFP Programming Contest 2022 &mdash; Specification
          </Box>
          <Box component='div' className={classes.subtitle}>
            The contest task: write programs in a small Instruction Set Language
            (ISL) that paint a canvas to reproduce a target image at the lowest
            cost. New here? Try the <a href='/playground'>Playground</a> or browse
            the <a href='/problems'>Problems</a>.
          </Box>
        </Box>
        <Box
          component='div'
          className={classes.markdown}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: html }}
        />
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
  content: {
    padding: theme.spacing(3),
    maxWidth: 880,
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  header: {
    marginBottom: theme.spacing(2),
  },
  title: {
    ...sharedStyles.h6,
    fontSize: 26,
  },
  subtitle: {
    ...sharedStyles.body1,
    color: '#555',
    marginTop: theme.spacing(1),
  },
  markdown: {
    ...sharedStyles.body1,
    lineHeight: 1.6,
    '& h1': {
      fontSize: 26,
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(1),
      borderBottom: '1px solid #e0e0e0',
      paddingBottom: 6,
    },
    '& h2': {
      fontSize: 21,
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(0.5),
    },
    '& h3': {
      fontSize: 17,
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(0.5),
    },
    '& p': { margin: `${theme.spacing(1)} 0` },
    '& a': { color: '#1976d2' },
    '& code': {
      backgroundColor: '#f0f0f0',
      padding: '1px 5px',
      borderRadius: 3,
      fontSize: '0.9em',
    },
    '& pre': {
      backgroundColor: '#f6f8fa',
      padding: theme.spacing(1.5),
      borderRadius: 6,
      overflowX: 'auto',
    },
    '& pre code': { backgroundColor: 'transparent', padding: 0 },
    '& table': { borderCollapse: 'collapse', margin: `${theme.spacing(1.5)} 0` },
    '& th, & td': {
      border: '1px solid #ccc',
      padding: '6px 10px',
      textAlign: 'left',
    },
    '& img': {
      maxWidth: '100%',
      display: 'block',
      margin: `${theme.spacing(2)} auto`,
      border: '1px solid #eee',
      borderRadius: 4,
    },
    '& ul, & ol': { paddingLeft: theme.spacing(3) },
    '& blockquote': {
      borderLeft: '4px solid #ddd',
      margin: 0,
      paddingLeft: theme.spacing(1.5),
      color: '#555',
    },
  },
}));

export default Specification;
