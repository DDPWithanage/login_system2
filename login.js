const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const encoder = bodyParser.urlencoded();
const bcrypt = require("bcrypt");

const saltRounds = 10;
const app = express();
app.use("/assets", express.static("assets"));

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "hash"
});

//Connect to the database
connection.connect(function(error){
    if(error) throw error
    else console.log("Successfully connected to the database!")
});

app.get("/", function(req, res){
    res.sendFile(__dirname + "/signup.html");
})

app.get("/index", function(req, res){
    res.sendFile(__dirname + "/index.html");
})


let globalPassword="";

app.post("/add",encoder, async function(req, res){
    try{
        var Username = req.body.Username;
        console.log(Username);
        var Password = req.body.Password;
        console.log(Password);

        const hashPassword = await bcrypt.hash(Password, saltRounds);
        console.log(hashPassword);

        //save data to mysql database
        connection.query("INSERT INTO login (user_name, user_password) VALUES (?, ?)", [Username,hashPassword], function(error, results, fields){
            console.log("1 record inserted");
            res.redirect("/index");
            let alert = require('alert');
            alert("Account Created")

        })

        globalPassword = hashPassword;
        res.render("/auth", {Password: hashPassword})

    }catch(error){
        console.log(error);
    }
})

//Authenticate application with database
app.post("/auth",encoder,async function(req,res){
    try {
        var Username = req.body.Username;
        console.log(Username);

        console.log(globalPassword);

        //Select data from mysql database
        connection.query("select * from login where user_name = ? and user_password = ?", [Username, globalPassword], function (error, results, fields) {
            if (results.length > 0) {
                res.redirect("/welcome");
                console.log(results);
                let alert = require('alert');
                alert("Successfully login to the system")

            } else {
                res.redirect("/index");
                console.log(results);

            }
            res.end();
        })
    }catch (error){
        console.log(error);
    }

})

//Success login
app.get("/welcome", function(req, res){
    res.sendFile(__dirname + "/welcome.html")
})

//set app port
app.listen(4500);
