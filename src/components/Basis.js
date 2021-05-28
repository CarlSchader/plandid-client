import React, { useEffect, useState } from 'react';
import { Switch, Route } from 'react-router-dom';

import Landing from './Landing';
import Login from './Login';
import Policy from "./Policy";
import Calendar from './Calendar';
import People from './People';
import AppNav from './AppNav';
import Subscription from "./Subscription";
import Success from "./Success";

import { executeQuery } from '../utilities';
import config from '../config.json';

function Basis() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [tier, setTier] = useState(config.freeTierName);

    // eslint-disable-next-line
    useEffect(executeQuery({path: "/publicPost/isLoggedIn", data: {}, onResponse: res => {
        if (res.data) {
            setLoggedIn(true);
            executeQuery({path: "/userData/getTier", data: {}, onResponse: res => {setTier(res.data)}})();
        }
        else {
            setLoggedIn(false);
        }
    }}), []);

    // eslint-disable-next-line
    useEffect(() => {
        if (loggedIn) {
            executeQuery({path: "/userData/getTier", data: {}, onResponse: res => {setTier(res.data)}})();
        }
    }, [loggedIn]);

    if (loggedIn) {
        return (
            <div>
                <AppNav tier={tier} setLoggedIn={setLoggedIn}/>
                <Switch>
                    <Route exact path="/Calendar">
                        <Calendar tier={tier}/>
                    </Route>
                    <Route exact path="/People">
                        <People />
                    </Route>
                    <Route exact path="/Subscription">
                        <Subscription currentTier={tier}/>
                    </Route>
                    <Route exact path="/Success*">
                        <Success />
                    </Route>
                    <Route exact path ="/Login">
                        <Login loggedIn={loggedIn} setLoggedIn={setLoggedIn}/>
                    </Route>
                    {Policy()}
                    <Route exact path="/*">
                        <Calendar />
                    </Route>
                </Switch>
            </div>
        );
    }
    else {
        return (
            <Switch>
                <Route exact path ="/Login">
                    <Login setLoggedIn={setLoggedIn}/>
                </Route>
                {Policy()}
                <Route exact path="/*">
                    <Landing />
                </Route>
            </Switch>
        );
    }
}

export default Basis;