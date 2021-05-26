import React from "react";
import CategoryPicker from "./CategoryPicker";
import AvailabilitiesInterface from "./AvailibilityInterface";

import {makeStyles} from "@material-ui/core/styles";
import Avatar from '@material-ui/core/Avatar';
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
    avatar: {
        width: theme.spacing(12),
        height: theme.spacing(12),
        fontSize: "4rem",
        backgroundColor: theme.palette.primary.light,
    }
}));

export default function PersonPage(props) {
    const {
        name="", 
        categories={}, 
        availabilities=[],
        onClose=() => {},
        onChangeName=newName => {},
        onCategorySelect=category => {},
        onCategoryDeselect=category => {},
        onAddAvailability=(name, start, end, timezone, rrule) => {},
        onChangeAvailability=(name, index, start, end, timezone, rrule) => {},
        onRemoveAvailibility=(name, index) => {},
    } = props;
    const classes = useStyles();

    function handleChangeName(event) {
        event.preventDefault()
        const newName = event.target.value.trim();
        onChangeName(newName);
        event.target.blur();
    }

    return (
        <Grid className={classes.root} align="center" alignItems="center" justify="center" container spacing={2}>
            <Grid container>
                <Grid alignItems="flex-start" item xs={3} spacing={2}>
                    <Button style={{margin: "1.5rem"}} size="large" onClick={onClose} color="primary" variant="contained" >Back</Button>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Avatar className={classes.avatar} >{name[0]}</Avatar>
            </Grid>
            <Grid item xs={12}>
                <TextField 
                onKeyDown={(e) => {if (e.keyCode === 13) {handleChangeName(e)}}} 
                onBlur={handleChangeName} defaultValue={name} 
                label="Name"
                size="large"
                />
            </Grid>
            <Grid item xs={12}>
                <CategoryPicker selectedCategories={categories} onSelect={onCategorySelect} onDeselect={onCategoryDeselect} />
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h4">What times is {name} available?</Typography>
            </Grid>
            <Grid item xs={12}>
                <AvailabilitiesInterface 
                availabilities={availabilities} 
                onAdd={(start, end, timezone, rrule) => onAddAvailability(name, start, end, timezone, rrule)} 
                onChange={(index, start, end, timezone, rrule) => onChangeAvailability(name, index, start, end, timezone, rrule)} 
                onRemove={index => onRemoveAvailibility(name, index)}
                />
            </Grid>
        </Grid>
    );
}