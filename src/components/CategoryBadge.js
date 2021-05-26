import React from "react";
import Button from "@material-ui/core/Button";

function CategoryBadge({onDeselect=() => {}, onSelect=() => {}, selected=false, category=null, highlight=true}) {
    return (
        <Button 
        onClick={selected ? onDeselect : onSelect} 
        color="secondary.light"
        variant={selected ? "contained" : "outlined"}
        disableRipple={!highlight}

        >
            {category}
        </Button>
    );
}

export default CategoryBadge;