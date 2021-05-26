import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { executeQuery } from '../utilities';
import SignIn from "./SignIn";
import SignUp from "./SignUp";

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
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
      maxWidth: "20%"
  }
}));


function Login({setLoggedIn=() => {}}) {
    const [query, setQuery] = useState(null);
    let history = useHistory();

    const classes = useStyles();

    // eslint-disable-next-line
    useEffect(executeQuery(query), [query]);

    function signUpHandler(email, password) {
        setQuery({
            path: "/publicPost/signUp",
            data: {email: email, password: password},
            onResponse: (res) => {
                switch(res.data) {
                    case 0:
                        window.alert(`Email verification sent to ${email}`);
                        break;
                    case 1:
                        window.alert('Account already exists.');
                        break;
                    case 2:
                        window.alert('Verification already sent to this email.');
                        break;
                    default:
                        window.alert(res.data);
                        break;
                }
            }
        });
    }

    function loginHandler(email, password) {
        setQuery({
            path: "/publicPost/login",
            data: {email: email, password: password},
            onResponse: (res) => {
                switch(res.data) {
                    case 0:
                        setLoggedIn(true);
                        history.push("/Calendar")
                        break;
                    case 1:
                        window.alert('Email or password is incorrect.');
                        break;
                    default:
                        window.alert(res.data);
                        break;
                }
            }
        });
    }

    return (
        <div>
            <div className={classes.rootAppBar}>
                <AppBar position="static">
                    <Toolbar className={classes.toolbar}>
                        <img className={classes.logo} src={"/logo-secondary.png"} alt="logo" />
                    </Toolbar>
                </AppBar>
            </div>
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <SignUp signUpHandler={signUpHandler} />
                </Grid>
                <Grid item xs={6}>
                    <SignIn signInHandler={loginHandler} />
                </Grid>
            </Grid>
        </div>
    );
}

export default Login;
