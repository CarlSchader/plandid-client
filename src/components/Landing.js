import React from 'react';
import { useHistory } from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  rootAppBar: {
    flexGrow: 1,
  },
  toolbar: {
    minHeight: 128,
    alignItems: 'flex-start',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  title: {
    flexGrow: 1,
    alignSelf: 'flex-end',
  },
  logo: {
      maxWidth: "20%",
      alignSelf: 'flex-end'
  },
  button: {
    margin: "10px"
  },
  heroContent: {
    padding: theme.spacing(8, 0, 6),
  }
}));

function Landing() {
    const classes = useStyles();
    let history = useHistory();
    return (
        <div>
            <div className={classes.rootAppBar}>
                <AppBar position="static">
                    <Toolbar className={classes.toolbar}>
                    <img className={classes.logo} src={"/logo-secondary.png"} alt="logo" />
                    {/* <Typography className={classes.title} variant="h5" noWrap>
                        Scheduling simplified
                    </Typography> */}
                    </Toolbar>
                </AppBar>
            </div>
            <Container maxWidth="lg" component="main" className={classes.heroContent}>
                <Typography  variant="h2" align="center" color="textPrimary" gutterBottom>
                    Create a Schedule
                </Typography>
                
                <Typography variant="h5" align="center" color="textSecondary" component="p">
                Plandid is an easy scheduling app for groups. Create tasks and add people to your schedule. Plandid will automatically match tasks to people based on availibility and category
                </Typography>
                <Typography align="center">
                  <Button size="large" className={classes.button} onClick={function() {history.push('/Login')}} variant="contained" color="primary">Login</Button>
                </Typography>
            </Container>
        </div>
    );
}

export default Landing;