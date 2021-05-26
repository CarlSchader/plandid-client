import React from "react";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import CardHeader from "@material-ui/core/CardHeader";
import StarIcon from "@material-ui/icons/StarBorder";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    cardHeader: {
        backgroundColor: theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[700],
    },
        cardPricing: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'baseline',
        marginBottom: theme.spacing(2),
    },
}));

function ClickableCard(props) {
    const {title="", subheader="", price=null, description=[], buttonText="", buttonVariant="contained", star=false, onButtonClick=() => {}} = props;
    const classes = useStyles();

    return (
        <Card>
            <CardHeader
                title={title}
                subheader={subheader}
                titleTypographyProps={{ align: 'center' }}
                subheaderTypographyProps={{ align: 'center' }}
                action={star ? <StarIcon /> : null}
                className={classes.cardHeader}
            />
            <CardContent>
                {price ? (<div className={classes.cardPricing}>
                    <Typography component="h2" variant="h3" color="textPrimary">
                        ${price}
                    </Typography>
                    <Typography variant="h6" color="textSecondary">
                        /mo
                    </Typography>
                </div>) : null}
                <ul>
                {description.map((line) => (
                    <Typography component="li" variant="subtitle1" align="center" key={line}>
                    {line}
                    </Typography>
                ))}
                </ul>
            </CardContent>
            <CardActions>
                <Button onClick={onButtonClick} fullWidth variant={buttonVariant} color="primary">
                {buttonText}
                </Button>
            </CardActions>
        </Card>
    );
}

export default ClickableCard;