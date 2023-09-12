import sqlite3 from 'sqlite3';


let db = new sqlite3.Database('./db/taskLists.db');
// FIRST RUN TO CREATE TABLE ON DB => NEED TO MAKE  A NEW MODULE FOR THAT
db.serialize(() => {
  db.run("CREATE TABLE taskLists (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)");
  
  db.run("INSERT INTO taskLists (id, name) VALUES (1, 'work'),(2, 'hobbies'), (3, 'upskilling')", (err)=>{
    if(err){
      console.log(err.message)
    }else{
      console.log("Inserted succesfully...")
    }
  });
});
db.close();