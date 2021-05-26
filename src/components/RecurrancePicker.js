import React, {useState} from "react";
import {DateTime} from "luxon";
import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import TextField from "@material-ui/core/TextField";
import {MuiPickersUtilsProvider, KeyboardDatePicker} from "@material-ui/pickers";
import LuxonUtils from "@date-io/luxon";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

import {localDate} from "../utilities";

export default function RecurrancePicker(props) {
    const {info, recurrance, recurranceNumb, untilDate, setRecurrance, setRecurranceNumb, setUntilDate} = props;
    const [anchorEl, setAnchorEl] = useState(null);
    function datetimeLocalFormat(dt) {
        return dt.toFormat("yyyy-MM-dd") + 'T' + dt.toFormat("hh:mm:ss.SSS");
    }

    function recurranceJSX() {
        function onChangeUntil(date) {
            setUntilDate(DateTime.fromISO(date));
        }
        if (recurrance === "Once") {
            return <div></div>;
        }
        else {
            return (
                <div>
                    <InputLabel>Every</InputLabel>
                    <TextField
                        // label="Number"
                        type="number"
                        InputLabelProps={{
                        shrink: true,
                        }}
                        defaultValue={recurranceNumb.toString()}
                        onChange={e => setRecurranceNumb(parseInt(e.target.value))} 
                    />
                    <InputLabel>{recurrance === "Daily" ? (recurranceNumb > 1 ? "Days" : "Day") : (recurrance.substring(0, recurrance.length-2)) + (recurranceNumb === 1 ? '' : 's')}</InputLabel>
                    <FormHelperText>until</FormHelperText>
                    <MuiPickersUtilsProvider utils={LuxonUtils}>
                        <KeyboardDatePicker
                            id="untilDateElement"
                            disableToolbar
                            variant="inline"
                            format="yyyy-MM-dd"
                            margin="normal"
                            label="End date"
                            onChange={onChangeUntil}
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                            value={datetimeLocalFormat(untilDate)}
                            minDate={datetimeLocalFormat(localDate(info.event.extendedProps.start))}
                        />
                    </MuiPickersUtilsProvider>
                </div>
            );
        }
    }

    return (
        <div>
            <InputLabel>Repeat</InputLabel>
            <Button variant="outline" color="primary" onClick={event => setAnchorEl(event.currentTarget)}>{recurrance}</Button>
            <FormHelperText>
                This button changes how often this task get repeated.
            </FormHelperText>
            <Menu
            anchorEl={anchorEl}
            anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
            transformOrigin={{vertical: 'top', horizontal: 'center'}}
            open={anchorEl !== null}
            onClose={() => setAnchorEl(null)}
            >
                <MenuItem onClick={() => {setRecurrance("Once"); setAnchorEl(null)}}>Once</MenuItem>
                <MenuItem onClick={() => {setRecurrance("Daily"); setAnchorEl(null)}}>Daily</MenuItem>
                <MenuItem onClick={() => {setRecurrance("Weekly"); setAnchorEl(null)}}>Weekly</MenuItem>
                <MenuItem onClick={() => {setRecurrance("Monthly"); setAnchorEl(null)}}>Monthly</MenuItem>
                <MenuItem onClick={() => {setRecurrance("Yearly"); setAnchorEl(null)}}>Yearly</MenuItem>
            </Menu>
            {recurranceJSX()}
        </div>
    );
};