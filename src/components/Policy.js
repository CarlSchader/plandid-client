import React from "react";
import {Route} from 'react-router-dom';
import config from '../config.json';

import Pdf from "./Pdf";

function Policy() {
    return [
        <Route key={0} exact path ="/PrivacyPolicy">
            <Pdf fileName={config.url + "/policy/privacy_policy.pdf"}/>
        </Route>,
        <Route key={1} exact path ="/TermsOfService">
            <Pdf fileName={config.url + "/policy/terms_of_service.pdf"}/>
        </Route>,
        <Route key={2} exact path ="/CookiePolicy">
            <Pdf fileName={config.url + "/policy/cookie_policy.pdf"}/>
        </Route>
    ];
}

export default Policy;