import React, {useState} from "react";

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

export default function AddPersonDialog(props) {
    const {open=false, setOpen=() => {}, onAdd=name => {}} = props;
    const [newName, setNewName] = useState("");

    function addPerson() {
        onAdd(newName);
        handleClose();
    }

    function handleClose() {
        setOpen(false);
    }

    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle>New Person</DialogTitle>
            <DialogContent>
                <TextField 
                autoFocus
                margin="dense"
                label="Name"
                type="text"
                fullWidth
                onChange={event => setNewName(event.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={addPerson} color="primary">
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
};