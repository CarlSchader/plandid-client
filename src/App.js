import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import config from './config';

import Basis from './components/Basis';
// import './custom.scss';
import './App.css';

// Material-ui
// import 'fontsource-roboto';
import CssBaseline from '@material-ui/core/CssBaseline';
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';

const theme = createMuiTheme({
    palette: config.colors,
});

// Bootstrap
function setColors() {
    for (const color in config.colors) {
        document.documentElement.style.setProperty(`--${color}`, config.colors[color]);
    }
}

document.title = config.appName;

function App() {
    setColors();
    return (
        <React.Fragment>
            <CssBaseline />
            <ThemeProvider theme={theme}>
                <Router>
                    <Basis />
                </Router>
            </ThemeProvider>
        </React.Fragment>
    );
}

export default App;
