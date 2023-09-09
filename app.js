import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import sqlite3 from 'sqlite3';
sqlite3.verbose();
import {getRecords, insertNewList, deleteList} from './utils.js';

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

app.get("/:list", (req, res)=>{
    // res.render(`./${req.params.list}`)
    res.render("list", {content: req.params.list});
  })


//NEW LIST FORM CREATE
app.post("/create/newList", async (req, res)=>{
  let newName = req.body.name;
  newName = newName.toLowerCase();
  console.log(newName);
  //Retrieve lengthofLists
  let sqlLists = `SELECT name FROM taskLists`;
  let allLists = await getRecords(sqlLists);
  let newId = allLists.length + 1;
  
  let sql = `INSERT INTO taskLists(id, name) VALUES (${newId}, "${newName}")`
  let result = await insertNewList(sql);
  console.log(result)

  res.render("new_list", {content: result})
})

//DELETE EXISTING LIST
app.post("/delete/list", async (req,res)=>{
  let listToDelete = req.body.deleteList;
  
  let sql = `DELETE FROM taskLists WHERE name= "${listToDelete}"`;
  let result = await deleteList(sql);
  console.log(result);

  res.redirect("/");
})

//CONTACT FORM
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