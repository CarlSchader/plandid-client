import React, {useEffect, useState} from "react";
import { DateTime } from "luxon";
import {rruleString, rruleObject, copyObject} from "../utilities";

import {MuiPickersUtilsProvider, KeyboardDatePicker} from "@material-ui/pickers";
import LuxonUtils from "@date-io/luxon";

import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Radio from "@material-ui/core/Radio";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormLabel from "@material-ui/core/FormLabel";
import FlexibleBox from "./FlexibleBox";

export default function RRuleInterface(props) {
    const {dtStart=DateTime.local(), rrule="", setRRule=rrule => {}} = props;
    const rruleObj = rruleObject(rrule);
    const [frequency, setFrequency] = useState(rrule ? rruleObj.frequency : "WEEKLY");
    const [interval, setInterval] = useState(rrule ? rruleObj.interval : 1);
    const [count, setCount] = useState(rrule ? rruleObj.count : 1);
    const [until, setUntil] = useState(rrule ? rruleObj.until : DateTime.local().plus({weeks: 1}));
    const [byDay, setByDay] = useState(rrule ? rruleObj.byDay : ["MO"]);
    const [byMonthDay, setByMonthDay] = useState(rrule ? rruleObj.byMonthDay : DateTime.local().day);
    const [bySetPos, setBySetPos] = useState(rrule ? rruleObj.bySetPos : 1);
    const [byMonth, setByMonth] = useState(rrule ? rruleObj.byMonth : DateTime.local().month);

    const [endOption, setEndOption] = useState(rruleObj.until ? "UNTIL" : (rruleObj.count ? "COUNT" : "NONE"));
    const [monthlyOption, setMonthlyOption] = useState(rruleObj.frequency === "MONTHLY" && rruleObj.byMonthDay ? "BYMONTHDAY" : "BYSETPOS");
    const [yearlyOption, setYearlyOption] = useState(rruleObj.frequency === "YEARLY" && rruleObj.byMonthDay ? "BYMONTHDAY" : "BYSETPOS");

    useEffect(function() { // If there are problems, this needs to only set the new rrule with appropriate tokens based on the frequency.
        let finalObj = {};
        finalObj.start = dtStart;
        finalObj.frequency = frequency;
        finalObj.interval = interval;

        switch (frequency) {
            case "HOURLY":
                break;                
            case "DAILY":
                break;
            case "WEEKLY":
                finalObj.byDay = byDay;
                break;
            case "MONTHLY":
                switch (monthlyOption) {
                    case "BYMONTHDAY":
                        finalObj.byMonthDay = byMonthDay;
                        break;
                    case "BYSETPOS":
                        finalObj.byDay = byDay;
                        finalObj.bySetPos = bySetPos;
                        break;
                    default:
                        console.error("RRuleInterface: frequency monthlyOption default");
                        break;
                }
                break;
            case "YEARLY":
                finalObj.byMonth = byMonth;
                switch (yearlyOption) {
                    case "BYMONTHDAY":
                        finalObj.byMonthDay = byMonthDay;
                        break;
                    case "BYSETPOS":
                        finalObj.byDay = byDay;
                        finalObj.bySetPos = bySetPos;
                        break;
                    default:
                        console.error("RRuleInterface: frequency yearlyOption default");
                        break;
                }
                break;
            default:
                console.error("RRuleInterface: frequency default");
        }

        switch (endOption) {
            case "COUNT":
                finalObj.count = count;
                break;
            case "UNTIL":
                finalObj.until = until;
                break;
            default:
                break;
        }

        setRRule(rruleString(finalObj));
    }, [frequency, interval, count, until, byDay, byMonthDay, bySetPos, byMonth, dtStart, setRRule, endOption, monthlyOption, yearlyOption]);

    function frequencySelect() {
        const helperTextFromFreq = {
            "YEARLY": "years",
            "MONTHLY": "months",
            "WEEKLY": "weeks",
            "DAILY": "days",
            "HOURLY": "hours"
        }
        return (
            <FormControl>
                <FormLabel>Repeat</FormLabel>
                <Select label="Repeat" value={frequency} defaultValue="DAILY" onChange={e => setFrequency(e.target.value)}>
                    <MenuItem value="YEARLY">Yearly</MenuItem>
                    <MenuItem value="MONTHLY">Monthly</MenuItem>
                    <MenuItem value="WEEKLY">Weekly</MenuItem>
                    <MenuItem value="DAILY">Daily</MenuItem>
                    <MenuItem value="HOURLY">Hourly</MenuItem>
                </Select>
                <TextField 
                label="Every"
                type="number"
                helperText={interval > 1 ? helperTextFromFreq[frequency] : helperTextFromFreq[frequency].slice(0, helperTextFromFreq[frequency].length - 1)}
                defaultValue={interval} 
                onChange={e => setInterval(parseInt(e.target.value) >= 1 ? Math.floor(parseInt(e.target.value)) : 1)}
                />
            </FormControl>
        );
    }

    function endSelect() {
        let jsxEnd = <div></div>;
        switch (endOption) {
            case "COUNT":
                jsxEnd = (
                    <TextField 
                    type="number"
                    defaultValue={count || 1}
                    helperText={count > 1 ? "Times" : "Time"}
                    onChange={e => setCount(parseInt(e.target.value) >= 1 ? Math.floor(parseInt(e.target.value)) : 1)}
                    />
                );
                break;
            case "UNTIL":
                jsxEnd = (
                    <MuiPickersUtilsProvider utils={LuxonUtils}>
                        <KeyboardDatePicker
                            format="yyyy-MM-dd"
                            onChange={date => setUntil(DateTime.fromISO(date))}
                            value={until ? until.toFormat("yyyy-MM-dd") : DateTime.local().toFormat("yyyy-MM-dd")}
                            minDate={DateTime.local().toFormat("yyyy-MM-dd")}
                        />
                    </MuiPickersUtilsProvider>
                );
                break;
            case "NONE":
                break;
            default:
                console.error("RRuleInterface: endSelect default case");
                break;
        }

        return (
            <FormControl>
                <FormLabel>Stops Repeating</FormLabel>
                <Select label="End" value={endOption} defaultValue={1} onChange={e => setEndOption(e.target.value)}>
                    <MenuItem value="NONE">Never</MenuItem>
                    <MenuItem value="COUNT">After</MenuItem>
                    <MenuItem value="UNTIL">On Date</MenuItem>
                </Select>
                {jsxEnd}
            </FormControl>
        );
    }

    function weekly() {
        function daySelected(day) {
            if (Array.isArray(byDay)) return byDay.includes(day);
            else byDay.split(',').includes(day);
        }

        function handleClick(day) {
            let byDayCopy = copyObject(byDay);
            if (!Array.isArray(byDayCopy)) byDayCopy = byDayCopy.split(',');
            if (!daySelected(day)) byDayCopy.push(day);
            else if (byDayCopy.length > 1) byDayCopy.splice(byDayCopy.indexOf(day), 1);
            setByDay(byDayCopy);
        }

        if (!byDay) setByDay("MO");
        return [
            <FormLabel>Week Days</FormLabel>,
            <FlexibleBox>
                <Button color="primary" onClick={() => handleClick("MO")} variant={daySelected("MO") ? "contained" : "outlined"}>Monday</Button>
                <Button color="primary" onClick={() => handleClick("TU")} variant={daySelected("TU") ? "contained" : "outlined"}>Tuesday</Button>
                <Button color="primary" onClick={() => handleClick("WE")} variant={daySelected("WE") ? "contained" : "outlined"}>Wednesday</Button>
                <Button color="primary" onClick={() => handleClick("TH")} variant={daySelected("TH") ? "contained" : "outlined"}>Thursday</Button>
                <Button color="primary" onClick={() => handleClick("FR")} variant={daySelected("FR") ? "contained" : "outlined"}>Friday</Button>
                <Button color="primary" onClick={() => handleClick("SA")} variant={daySelected("SA") ? "contained" : "outlined"}>Saturday</Button>
                <Button color="primary" onClick={() => handleClick("SU")} variant={daySelected("SU") ? "contained" : "outlined"}>Sunday</Button>
            </FlexibleBox>
        ];
    }

    function monthly() {
        function populateMenuItems() {
            let jsx = [];
            for (let i = 1; i < 32; i++) jsx.push(<MenuItem value={i}>{i}</MenuItem>);
            return jsx;
        }

        let optionJsx =<div></div>;
        switch (monthlyOption) {
            case "BYMONTHDAY":
                optionJsx = [
                    <FormLabel>Day of the Month</FormLabel>,
                    <Select value={byMonthDay} onChange={e => setByMonthDay(parseInt(e.target.value))}>
                        {populateMenuItems()}
                    </Select>
                ];
                break;
            case "BYSETPOS":
                let byDayString = copyObject(byDay);
                if (Array.isArray(byDay)) byDayString = byDayString.join(',');
                optionJsx = [
                    <Select value={bySetPos} defaultValue={1} onChange={e => setBySetPos(parseInt(e.target.value))}>
                        <MenuItem value={1}>First</MenuItem>
                        <MenuItem value={2}>Second</MenuItem>
                        <MenuItem value={3}>Third</MenuItem>
                        <MenuItem value={4}>Fourth</MenuItem>
                        <MenuItem value={-1}>Last</MenuItem>
                    </Select>,
                    <Select value={byDayString} defaultValue={1} onChange={e => setByDay(e.target.value.split(','))}>
                        <MenuItem value={"MO"}>Monday</MenuItem>
                        <MenuItem value={"TU"}>Tuesday</MenuItem>
                        <MenuItem value={"WE"}>Wednesday</MenuItem>
                        <MenuItem value={"TH"}>Thursday</MenuItem>
                        <MenuItem value={"FR"}>Friday</MenuItem>
                        <MenuItem value={"SA"}>Saturday</MenuItem>
                        <MenuItem value={"SU"}>Sunday</MenuItem>
                        <MenuItem value={"MO,TU,WE,TH,FR,SA,SU"}>Day</MenuItem>
                        <MenuItem value={"MO,TU,WE,TH,FR"}>Weekday</MenuItem>
                        <MenuItem value={"SA,SU"}>Weekend Day</MenuItem>
                    </Select>
                ];
                break;
            default:
                console.error("RRuleInterface: monthlyOption default case");
                break;
        }
        return (
            <Grid container justify="center" alignItems="center" spacing={2}>
                <Grid item xs={12}>
                    <FormControl component="fieldset">
                        <RadioGroup row name="position" value={monthlyOption === "BYMONTHDAY" ? "left" : "right"} defaultValue="left">
                            <FormControlLabel
                            value="left"
                            control={<Radio onChange={e => {if (e.target.checked) setMonthlyOption("BYMONTHDAY")}} color="primary" />}
                            label="On Day"
                            labelPlacement="top"
                            />
                            <FormControlLabel
                            value="right"
                            control={<Radio onChange={e => {if (e.target.checked) setMonthlyOption("BYSETPOS")}} color="primary" />}
                            label="On The"
                            labelPlacement="top"
                            />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    {optionJsx}
                </Grid>
            </Grid>
        );
    }

    function yearly() {
        function populateDayItems() {
            let jsx = [];
            for (let i = 1; i < 32; i++) jsx.push(<MenuItem value={i}>{i}</MenuItem>);
            return jsx;
        }

        let optionJsx =<div></div>;
        switch (yearlyOption) {
            case "BYMONTHDAY":
                optionJsx = [
                    <Select value={byMonth} defaultValue={DateTime.local().month} onChange={e => setByMonth(parseInt(e.target.value))}>
                        <MenuItem value={1}>January</MenuItem>
                        <MenuItem value={2}>February</MenuItem>
                        <MenuItem value={3}>March</MenuItem>
                        <MenuItem value={4}>April</MenuItem>
                        <MenuItem value={5}>May</MenuItem>
                        <MenuItem value={6}>June</MenuItem>
                        <MenuItem value={7}>July</MenuItem>
                        <MenuItem value={8}>August</MenuItem>
                        <MenuItem value={9}>September</MenuItem>
                        <MenuItem value={10}>October</MenuItem>
                        <MenuItem value={11}>November</MenuItem>
                        <MenuItem value={12}>December</MenuItem>
                    </Select>,
                    <Select value={byMonthDay} defaultValue={1} onChange={e => setByMonthDay(parseInt(e.target.value))}>
                        {populateDayItems()}
                    </Select>
                ];
                break;
            case "BYSETPOS":
                let byDayString = copyObject(byDay);
                if (Array.isArray(byDay)) byDayString = byDayString.join(',');
                optionJsx = [
                    <Select value={bySetPos} defaultValue={1} onChange={e => setBySetPos(parseInt(e.target.value))}>
                        <MenuItem value={1}>First</MenuItem>
                        <MenuItem value={2}>Second</MenuItem>
                        <MenuItem value={3}>Third</MenuItem>
                        <MenuItem value={4}>Fourth</MenuItem>
                        <MenuItem value={-1}>Last</MenuItem>
                    </Select>,
                    <Select value={byDayString} defaultValue={"MO"} onChange={e => setByDay(e.target.value.split(','))}>
                        <MenuItem value={"MO"}>Monday</MenuItem>
                        <MenuItem value={"TU"}>Tuesday</MenuItem>
                        <MenuItem value={"WE"}>Wednesday</MenuItem>
                        <MenuItem value={"TH"}>Thursday</MenuItem>
                        <MenuItem value={"FR"}>Friday</MenuItem>
                        <MenuItem value={"SA"}>Saturday</MenuItem>
                        <MenuItem value={"SU"}>Sunday</MenuItem>
                        <MenuItem value={"MO,TU,WE,TH,FR,SA,SU"}>Day</MenuItem>
                        <MenuItem value={"MO,TU,WE,TH,FR"}>Weekday</MenuItem>
                        <MenuItem value={"SA,SU"}>Weekend Day</MenuItem>
                    </Select>,
                    <Select value={byMonth} defaultValue={DateTime.local().month} onChange={e => setByMonth(parseInt(e.target.value))}>
                        <MenuItem value={1}>January</MenuItem>
                        <MenuItem value={2}>February</MenuItem>
                        <MenuItem value={3}>March</MenuItem>
                        <MenuItem value={4}>April</MenuItem>
                        <MenuItem value={5}>May</MenuItem>
                        <MenuItem value={6}>June</MenuItem>
                        <MenuItem value={7}>July</MenuItem>
                        <MenuItem value={8}>August</MenuItem>
                        <MenuItem value={9}>September</MenuItem>
                        <MenuItem value={10}>October</MenuItem>
                        <MenuItem value={11}>November</MenuItem>
                        <MenuItem value={12}>December</MenuItem>
                    </Select>
                ];
                break;
            default:
                console.error("RRuleInterface: yearlyOption default case");
                break;
        }
        return (
            <Grid container justify="center" alignItems="center" spacing={2}>
                <Grid item xs={12}>
                    <FormControl component="fieldset">
                        <RadioGroup row name="position" value={yearlyOption === "BYMONTHDAY" ? "left" : "right"} defaultValue="left">
                            <FormControlLabel
                            value="left"
                            control={<Radio onChange={e => {if (e.target.checked) setYearlyOption("BYMONTHDAY")}} color="primary" />}
                            label="On"
                            labelPlacement="top"
                            />
                            <FormControlLabel
                            value="right"
                            control={<Radio onChange={e => {if (e.target.checked) setYearlyOption("BYSETPOS")}} color="primary" />}
                            label="On The"
                            labelPlacement="top"
                            />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    {optionJsx}
                </Grid>
            </Grid>
        );
    }

    const frequencyJsx = {
        "HOURLY": () => {},
        "DAILY": () => {},
        "WEEKLY": weekly,
        "MONTHLY": monthly,
        "YEARLY": yearly
    };

    return (
        <Grid style={{flexGrow: 1, padding: "1rem"}} container justify="center" alignItems="center" spacing={2}>
            <Grid item xs={12}>
                {frequencySelect()}
            </Grid>
            <Grid item xs={12}>
                {frequencyJsx[frequency]()}
            </Grid>
            <Grid item xs={12}>
                {endSelect()}
            </Grid>
        </Grid>
    );
};