import sqlite3 from 'sqlite3';
let db = new sqlite3.Database('./db/taskLists.db');

export function getRecords(sql){
    let data = [];
    return new Promise(resolve=>{
        db.all(sql,[],(err,rows)=>{
            if(err){
                return console.error(err.message);
            }
            rows.forEach((row)=>{
                data.push(row.name);
            });
            resolve(data);
        });
    });
};

export function insertNewList(sql){
    console.log(sql);
    return new Promise(resolve=>{
        db.run(sql, (err)=>{
            if(err){
                return console.error(err.message);
            }
            resolve("Inserted succesfully!")
        })
    })
}

export function deleteList(sql){
    return new Promise(resolve=>{
        db.run(sql, (err)=>{
            if(err){
                return console.error(err.message);
            }
            resolve("Deleted succesfully!")
        })
    })
}


