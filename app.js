//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

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

const listSchema = {
    name: String,
    items: [itemSchema]

};

const List = mongoose.model("List", listSchema);

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
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({name: itemName})

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({
            name: listName
        }, (err, foundList) => {
            foundList
                .items
                .push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }

});

app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, (error) => {
            if (error) {
                console.log(error);
            } else {
                console.log("Deleted");
                res.redirect("/");
            }
        })
    } else {
        List.findOneAndUpdate({
            name: listName
        }, {
            $pull: {
                items: {
                    _id: checkedItemId
                }
            }
        }, (err, foundList) => {
            if (!err) {
                res.redirect("/" + listName);
            }
        })
    }
})

app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({
        name: customListName
    }, (error, foundList) => {
        if (!error) {
            if (!foundList) {
                //create a new List;
                const list = new List({name: customListName, items: defaultItems});
                list.save();
                res.redirect("/" + customListName);
            } else {
                //Show an existing list;
                res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.items
                });
            }
        }
    })

})

app.listen(3000, function () {
    console.log("Server started on port 3000");
});
