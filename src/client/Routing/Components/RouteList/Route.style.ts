import { makeStyles } from '@material-ui/styles';

export const gridStyle = {
  gridTemplateColumns: '2fr 2fr 2fr 1fr',
  gridTemplateRows: '60px 20px',
  display: 'grid',
  marginBottom: '.2em',
  alignItems: 'center',
};

export default makeStyles({
  main: {
    minHeight: '3em',
    gridTemplateRows: '2.5em 1fr',
    alignItems: 'center',
    ...gridStyle,
  },

  products: {
    fontSize: '.9em',
    gridArea: '2 / 1 / 3 / 5',
  },

  detail: {
    textDecoration: 'initial',
    overflow: 'hidden',
    gridArea: '3 / 1 / 4 / 5',
  },

  time: {
    '& > span': {
      marginRight: '.2em',
    },
  },
});
