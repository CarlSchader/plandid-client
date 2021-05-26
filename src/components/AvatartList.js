import React from "react";

import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import CancelIcon from '@material-ui/icons/Cancel';
import AddIcon from "@material-ui/icons/Add";
import IconButton from "@material-ui/core/IconButton";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
    avatar: {
        color: theme.palette.getContrastText(theme.palette.primary.light),
        backgroundColor: theme.palette.primary.light,
    },
}));

/* inputObjects: each objects has
  jsx: The jsx for that item.
  src: The src link for the avatar photo.
  onClick:
  onDelete:
*/
export default function AvatarList({inputObjects=[], onAdd=null, addString=""}) {
    const classes = useStyles();

    function listItemsJsx() {
        let jsxList = [];
        for (let i = 0; i < inputObjects.length; i++) {
            jsxList.push(
                <ListItem key={i} button onClick={inputObjects[i].onClick}>
                    <ListItemAvatar>
                        <Avatar
                            className={classes.avatar}
                            alt={`Avatar °${i}`}
                            src={inputObjects[i].src}
                        >
                            {inputObjects[i].avatarChildren ? inputObjects[i].avatarChildren : null}
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={inputObjects[i].jsx} />
                    <ListItemSecondaryAction>
                        {inputObjects[i].onDelete ? 
                        <IconButton
                        onClick={inputObjects[i].onDelete}
                        color="light"
                        >
                            <CancelIcon />
                        </IconButton> : <div></div>}
                    </ListItemSecondaryAction>
                </ListItem>
            );
        }
        if (onAdd !== null) {
            jsxList.push(
                <ListItem key={inputObjects.length} button onClick={onAdd}>
                    <ListItemAvatar>
                        <Avatar>
                            <AddIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={addString} />
                </ListItem>
            );
        }
        return jsxList;
    }

    return (
        <List dense className={classes.root}>
            {listItemsJsx()}
        </List>
    );
};