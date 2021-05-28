import React from "react";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import {makeStyles} from "@material-ui/core/styles"
import { loadStripe } from '@stripe/stripe-js';
import {executeQuery} from "../utilities";
import config from '../config.json';

import ClickableCard from "./ClickableCard";

const useStyles = makeStyles(theme => ({
    heroContent: {
        padding: theme.spacing(8, 0, 6),
    },
    cards: {
        justifyContent: "center",
        alignItems: "center",
    }
}));

function Subscription({currentTier=config.freeTierName}) {
    const classes = useStyles();

    function handleClick(upgradeTier) {
        return async function() {
            const stripePromise = loadStripe(config.stripe.publicKey);
            // Get Stripe.js instance
            const stripe = await stripePromise;
            // Call your backend to create the Checkout Session
            executeQuery({
                path: "/stripeRoutes/create-checkout-session",
                data: {upgradeTier: upgradeTier},
                onResponse: async function(response) {
                    const session = response.data;

                    // When the customer clicks on the button, redirect them to Checkout.
                    const result = await stripe.redirectToCheckout({
                        sessionId: session.sessionId,
                    });

                    if (result.error) {
                        // If `redirectToCheckout` fails due to a browser or network
                        // error, display the localized error message to your customer
                        // using `result.error.message`.
                        window.alert(result.error.message);
                    }
                }
            })();
        };
    };

    function tierCardsJsx() {
        let jsx = [];
        for (const tierName in config.tiers) {
            if (tierName !== config.freeTierName && tierName !== currentTier) {
                jsx.push(
                    <Grid item key={tierName} xs={12} sm={6} md={4}>
                        <ClickableCard  
                        title={tierName.charAt(0).toUpperCase() + tierName.slice(1)}
                        subheader={null}
                        price={config.tiers[tierName].price}
                        description={[]}
                        buttonText="Get Started"
                        buttonVariant="contained"
                        star={true}
                        onButtonClick={handleClick(tierName)}
                        />
                    </Grid>
                );
            }
        }
        if (currentTier !== config.freeTierName) {
            jsx.push(
                <Grid item key={config.freeTierName} xs={12}  sm={6} md={4}>
                    <ClickableCard 
                    onButtonClick={executeQuery({path: "/stripeRoutes/customer-portal", onResponse: res => window.location.href = res.data.url})}
                    title={"Manage Subscription"}
                    price={null}
                    description={["Manage current subscriptions to Plandid here."]}
                    buttonVariant="outlined"
                    buttonText="To Subscriptions"
                    >
                        
                    </ClickableCard>
                </Grid>
            );
        }
        return jsx;
    }

    return (
        <div>
        <Container maxWidth="sm" component="main" className={classes.heroContent}>
            <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
                Premium
            </Typography>
            <Typography variant="h5" align="center" color="textSecondary" component="p">
                Get premium and upgrade:
                (list of important features)
            </Typography>
        </Container>
        <Container className={classes.cards} maxWidth="md" component="main">
            <Grid container spacing={5} alignItems="flex-end">
                {tierCardsJsx()}
            </Grid>
        </Container>
        </div>
    );
}

export default Subscription;