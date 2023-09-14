import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import sqlite3 from 'sqlite3';
sqlite3.verbose();
import {getRecords, getTasks, insertNewList, deleteList, createNewListTable, deleteListTable} from './utils.js';

// let db = new sqlite3.Database('./db/taskLists.db');

const work = [
    {   id: 1,
        task: "Some new task",
        deadline: "22-01-2025 10:00"
    },
    {   id: 2,
        task: "Some new task",
        deadline: "23-01-2025 10:00"
    },
    {   id: 3,
        task: "Some new task",
        deadline: "24-01-2025 10:00"
    },
]
const app = express();

let PORT = process.env.PORT;
if (PORT == null || PORT == "") {
  PORT = 8080;
}

const _dirname = path.dirname("C:\Users\panos\projects\todolist")


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(
    "/css",
    express.static(path.join(_dirname, "node_modules/bootstrap/dist/css"))
  )
  app.use(
    "/js",
    express.static(path.join(_dirname, "node_modules/bootstrap/dist/js"))
  )
  app.use("/js", express.static(path.join(_dirname, "node_modules/jquery/dist")))

//HOME
app.get("/", async (req,res)=>{
  let sql = `SELECT name FROM taskLists`;
  let allLists = await getRecords(sql);
  
  res.render('home', {content: allLists})
})


//ROUTES

app.get("/create/newList", (req,res)=>{
  res.render("new_list")
})

app.get("/:list", async (req, res)=>{
    // res.render(`./${req.params.list}`)
    let listname = req.params.list.slice(1)
    
    let sql = `SELECT task FROM ${listname}`;
    let allTasks = await getTasks(sql);
    
    res.render("list", {content: allTasks, listName: listname.toUpperCase()});
  })


//NEW LIST FORM CREATE
app.post("/create/newList", async (req, res)=>{
  let newName = req.body.name;
  newName = newName.toLowerCase();
  //Retrieve lengthofLists
  let sqlLists = `SELECT name FROM taskLists`;
  let allLists = await getRecords(sqlLists);
  //CREATE THE NEW LIST
  let sqlCreateList = `CREATE TABLE ${newName} (${newName}id INTEGER PRIMARY KEY AUTOINCREMENT, task TEXT)`
  let resultNewList = await createNewListTable(sqlCreateList);
  
  let sql = `INSERT INTO taskLists(name) VALUES ("${newName}")`
  let result = await insertNewList(sql);

  res.redirect("/")
})

//DELETE EXISTING LIST
app.post("/delete/list", async (req,res)=>{
  let listToDelete = req.body.deleteList;
  //DELETE FROM LISTS
  let sql = `DELETE FROM taskLists WHERE name= "${listToDelete}"`;
  let result = await deleteList(sql);
  //DELETE THE EXISTING TABLE OF LIST
  let sqlDeleteListTable = `DROP TABLE ${listToDelete}`
  let resultDeleteList = await deleteListTable(sqlDeleteListTable);

  res.redirect("/");
})

// TASKS OF LIST
app.get("/:list/create/newTask", (req,res)=>{
  let listName = req.params.list.slice(1)
  res.render("new_task", {content: listName})
})

app.post("/:list/create/newTask",async (req,res)=>{
  let newTask = req.body.task;
  let listName = req.params.list
  //Retrieve lengthofLists
  let sqlLists = `SELECT task FROM ${listName}`;
  let allLists = await getRecords(sqlLists);
  let newId = allLists.length + 1;
  
  let sql = `INSERT INTO ${listName}(${listName}id, task) VALUES (${newId}, "${newTask}")`
  let result = await insertNewList(sql);

  res.redirect(`/:${listName}`)
})

// DELETING EXISTING TASK

app.post("/delete/task", async (req,res)=>{
  let listToDelete = await req.body.deleteList;
  let taskToDelete = await req.body.deleteTask;
  //DELETE FROM LISTS
  let sql = `DELETE FROM ${listToDelete} WHERE task= "${taskToDelete}"`;
  let result = await deleteList(sql);
  console.log(result);
  
  res.redirect(`/:${listToDelete}`);
})

//CONTACT FORM
app.get("/contact/form", (req,res)=>{
  res.render("contact")
})

app.post("/contact", async (req,res)=>{
  console.log(req.body)
  let content = "Thank you for your contact. We will reach to you as soon as possible!"
  
  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      port: 465,
      auth: {
        user: process.env.USER,
        pass: process.env.PASSWORD
      }
    });
    
    let mailOptions = {
      from: process.env.EMAIL,
      to: process.env.EMAIL_TO_SEND,
      subject: 'Sending Email using Node.js',
      text: `Message from weather APP
            from ${req.body.name} ${req.body.surname}
            email: ${req.body.email}
            message: ${req.body.message}`
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
        res.render("./contact", {content: "Thank you for your contact. We will reach to you as soon as possible!"})
      }
    });
  } catch (error) {
    res.render("./contact", {content: "There was an Error. Please try again!"})
    res.send("Message Could not be Sent");
  }
})


app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}.`)
})