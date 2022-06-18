//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect('mongodb://127.0.0.1:27017/toDoListDB');

// const toDoListSchema = new mongoose.Schema({     target: {         type:
// String,         required: [true, "Target is required."]     },     success: {
// type: Number,         required: [true, "Success or not is required."]     }
// }); const Item = mongoose.model("Item", toDoListSchema);

const itemSchema = {
    name: {
        type: String,
        require: [1, "Name is must."]
    }
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({name: "Welcome to your to do list."});
const item2 = new Item({name: "Hit the + button to add a new item."});
const item3 = new Item({name: "<-- Hit this to delete and item."});

const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {

    Item.find({}, (error, foundItems) => {

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, (error) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Inserted!");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {
                listTitle: "Today",
                newListItems: foundItems
            });
        }
    })

});

app.post("/", function (req, res) {

    const item = req.body.newItem;

    if (req.body.list === "Work") {
        workItems.push(item);
        res.redirect("/work");
    } else {
        items.push(item);
        res.redirect("/");
    }
});

app.get("/work", function (req, res) {
    res.render("list", {
        listTitle: "Work List",
        newListItems: workItems
    });
});

app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(3000, function () {
    console.log("Server started on port 3000");
});
