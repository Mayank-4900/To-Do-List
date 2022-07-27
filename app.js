const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _ =require("lodash");

const app=express();
const workItems=[];

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set("view engine", "ejs");
mongoose.connect('mongodb+srv://MayankRoy4900:Mayank%402000@cluster0.ac9da.mongodb.net/?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});


const itemsSchema=new mongoose.Schema({
  name:String
});

const Item=mongoose.model("Item",itemsSchema);

const task1=new Item({
  name:"Welcome to To-Do List"
});

const task2=new Item({
  name:"Hit + to add a new item"
});

const task3=new Item({
  name:"<-- Hit this to delete an item"
});

const defaultItems=[task1,task2,task3];

const listSchema=new mongoose.Schema({
  name:String,
  items:[itemsSchema]
});

const List=mongoose.model("List",listSchema);


app.get("/",function(req, res){
  Item.find({},function(err,foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){ console.log("Error"); }
        else{ console.log("Operation Successful"); }
      });
      res.redirect("/");
    } else {
      res.render("list",{listTitle:"Today", newListItem:foundItems});
    }

  })
});

app.post("/",function(req,res){
  console.log(req.body);
  const itemName=req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });

  if(listName=="Today"){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

app.post("/delete",function(req,res){

  const id = (req.body.checkbox);
  const listName=req.body.listName;

  if(listName=="Today"){
    Item.findByIdAndRemove(id,function(err){
      if(!err){
        console.log("Deleted");
        res.redirect("/");
      }
      });
  } else{
    List.findOneAndUpdate({name:listName},{$pull: {items:{_id:id}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }


});

app.get("/:customListName",function(req,res){
  //
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList) {
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else {
        res.render("list",{listTitle:foundList.name, newListItem:foundList.items});
      }
    }
  });


});

app.post("/work",function(req,res){
  let item=req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

app.get("/about",function(req,res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, function(){
  console.log("Server started on port 3000");
});
