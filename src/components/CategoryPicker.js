import React, {useState, useEffect} from "react";
// import { Form, Button } from 'react-bootstrap';
import AddIcon from '@material-ui/icons/Add';
import InputLabel from "@material-ui/core/InputLabel";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

import {executeQuery, copyObject} from "../utilities";

import FlexibleBox from "./FlexibleBox";
import CategoryBadge from "./CategoryBadge";

function CategoryPicker({selectedCategories={}, onSelect=cat => {}, onDeselect=cat => {}}) {
    const [query, setQuery] = useState(null);
    const [categories, setCategories] = useState(null);
    const [addingCat, setAddingCat] = useState(false);

    // eslint-disable-next-line
    useEffect(executeQuery(query, {path: "/categories/getCategories", data: {}, onResponse: (res) => {
        setCategories(res.data);
    }}), [query]);

    function makeCategoryBadges() {
        let jsx = [];
        for (let cat in categories) {
            jsx.push(<CategoryBadge 
                selected={cat in selectedCategories} 
                category={cat} 
                onSelect={() => onSelect(cat)} 
                onDeselect={() => onDeselect(cat)} 
                />
            );
        }
        return jsx;
    }

    function addCategory(category) {
        let categoriesCopy = copyObject(categories);
        categoriesCopy[category.trim().toLowerCase()] = "";
        setCategories(categoriesCopy);
        setQuery({path: "/categories/addCategory", data: {category: category}});
    }

    function addCatJSX() {
        if (addingCat) {
            function onBlur() {
                const name = document.getElementById("add-cat").value.trim();
                if (name && name.length > 0 && name !== '+') {
                    addCategory(name);
                }
                setAddingCat(false);
            }
            return <TextField onKeyDown={(e) => {if (e.keyCode === 13) {onBlur()}}} onBlur={onBlur} label="New Category" autoFocus id="add-cat" />;
        }
        else {
            return <Button variant="outlined" color="secondary.light" onClick={() => {setAddingCat(true)}}><AddIcon /></Button>
        }
    }

    return (
        <div>
            <InputLabel>Categories</InputLabel>
            <InputLabel>Only people who have the selected category can work this task.</InputLabel>
            <FlexibleBox>{makeCategoryBadges()}{addCatJSX()}</FlexibleBox>
        </div>
    )
}

export default CategoryPicker;