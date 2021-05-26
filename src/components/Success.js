import React, {useEffect, useState} from "react";
import {useHistory} from "react-router-dom";
import {Jumbotron, Button} from "react-bootstrap";
import {executeQuery} from "../utilities";

function Success({setTier=() => {}}) {
    const [jsx, setJsx] = useState(<></>);
    let history = useHistory();

    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");

    function billingOnClick(e) {
        e.preventDefault();
        executeQuery({
            path: '/stripeRoutes/customer-portal',
            data: {},
            onResponse: function(res) {
                window.location.href = res.data.url;
            }
        })();
    }

    // eslint-disable-next-line
    useEffect(executeQuery({
        path: "/stripeRoutes/checkout-session",
        data: {sessionId: sessionId},
        onResponse: req => {
            if (req.data) {
                setJsx(
                    <div>
                        <Jumbotron className="bg-light text-primary">
                            <h1>Welcome to Plandid Premium</h1>
                            <h5>You have successfully subscribed!</h5>
                        </Jumbotron>
                        <Button className="m-2" onClick={() => {history.push("/Login")}}>Login</Button>
                        <Button className="m-2" onClick={billingOnClick}>Billing</Button>
                    </div>
                );
            }
            else {
                setJsx(
                    <div>
                        <Jumbotron className="bg-light text-primary">
                            <h1>Subscription Unsuccessfull</h1>
                            <h5>Whoops! Something went wrong. Please try again.</h5>
                        </Jumbotron>
                        <Button className="m-2" onClick={() => {history.push("/Login")}}>Login</Button>
                        <Button className="m-2" onClick={() => {history.push("/Subscription")}}>Get Premium</Button>
                    </div>
                );
            }
        }
    }), []);

    return jsx;
}

export default Success;