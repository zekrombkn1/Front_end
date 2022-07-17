var sqlite3 = require('sqlite3').verbose();
var express = require('express');
var http = require('http');
const { resolve } = require('path');
var path = require("path");
var app = express();
var server = http.createServer(app);
var db = new sqlite3.Database('./tareas.db');


db.run('CREATE TABLE IF NOT EXISTS tareas(id int, tarea varchar(240), prioridad int, estado int)');


app.get('/', function(req, res){
  res.sendFile(path.join( __dirname,'./front/index.html' ));
});
app.use(express.static('views'));




app.get('/add', function(req,res){

  db.serialize(()=>{
    try {
      db.run(
        "INSERT INTO tareas(id, tarea, prioridad, estado) VALUES(?,?,?,?)",
        [1, req.query.tarea, req.query.prioridad, req.query.estado],
        function (err) {
          console.log("Tarea registrada exitosamene.");
          res.sendFile(path.join(__dirname, "./front/index.html"));
          db.run(
            "Update tareas SET id=x.rn from (SELECT tarea, row_number() over (partition by 1 order by prioridad) rn from tareas) x where tareas.tarea=x.tarea"
          );
        }
      );
    } catch (e) {
      return console.log(e.message);
    }
  });
});



app.get('/view.json',function(req,res){
  db.serialize(()=>{
    try{
      db.all('SELECT * FROM tareas ORDER BY prioridad ASC', [], function(err,row) {
        res.setHeader('Access-Control-Allow-Origin','*');
        res.setHeader('Access-Control-Allow-Method','GET');
        res.send(row);
      });
    } catch (error){
      return console.log(error.mesagge);
    }
  });
});




app.get("/update", function (req, res) {

  db.serialize(() => {
    try {
      db.all(
        "UPDATE tareas SET tarea = ?, prioridad = ?, estado = ? WHERE id = ?",
        [req.query.tarea, req.query.prioridad, req.query.estado, req.query.id],
        function (err, row) {
          console.log("Se ah actualizado exitosamente.");
          res.sendFile(path.join(__dirname, "./front/index.html"));
        }
      );
    } catch (e) {
      return console.log(e.message);
    }
  });
});




app.get('/delete',function(req,res){
  db.serialize(()=>{
    try {
      db.all("DELETE FROM tareas WHERE id =?", [req.query.id],
      function(err, roe){
        console.log("Tarea eliminada exitosamente.");
        res.sendFile(path.join(__dirname, "./front/index.html"));
      });
    } catch (e) {
      return console.log(e.mesagge);
    }
  });
});





app.get('/close', function(req,res){
  db.close((err) => {
    if (err) {
      res.send('There is an error while closing the database');
      return console.error(err.message);
    }
    console.log('The database is being disconected.');
    res.send('Database connection successfully closed');
  });

});




server.listen(3000, function(){
  console.log("server is listening on port: http://localhost:3000/");
});