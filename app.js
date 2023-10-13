//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();
var foundItems;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://SaiKrishnaSB:<password>@cluster0.ygcqdst.mongodb.net/?retryWrites=true&w=majority");

const itemsSchema = {
  name: String
};

const Item = mongoose.model(
  "Item",itemsSchema
);

const item1 = new Item ({
  name: "welcome to TaskNaut",
});

const item2 = new Item ({
  name: "click + to add tasks"
})

const item3 = new Item ({
  name: "Check the box to remove tasks"
})

const defaultItems = [item1 , item2 , item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

 Item.find({}).exec()
 .then(foundItems => {
  if(foundItems.length==0) {
    Item.insertMany(defaultItems)
    .then(() => {
    console.log("success");
  })
    .catch(err => {
    console.log(err); 
  });
 res.redirect("/");
} 
else {
  res.render("list", {listTitle:"Today",newListItems:foundItems});
 }
})
  .catch(err=>{
  console.log(err);});
});

app.get("/:customListName", async function(req,res){
  const customListName= _.capitalize(req.params.customListName);

  try {
    const foundList = await List.findOne({ name: customListName });
  
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems,
      });
  
      await list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items,
      });
    }
  } catch (err) {
    console.error(err);
  }
  
});



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  });

  if (listName == "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .then(foundList => {
        if (foundList) {
          foundList.items.push(item);
          foundList.save();
          res.redirect("/" + listName);
        } else {
          res.redirect("/");
        }
      })
      .catch(err => {
        console.log(err);
      });
  }
  

  
});

app.post("/delete",function(req,res){
 const checkedItemId=req.body.checkbox;
 const listName=req.body.listName;

 if (listName == "Today"){
  Item.findByIdAndRemove(checkedItemId)
  .then(()=>{
  console.log("removed succesfully")
 })
 .catch(err=>{
   console.log(err);});
  res.redirect("/");

} else {
  List.findOneAndUpdate( {name: listName}, {$pull: {items: {_id: checkedItemId}}})
  .then(foundList =>{
   res.redirect('/' + listName);
  })
   .catch(err => {
    console.log(err);
  })
 }
 });






app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
