var sjcl = require('sjcl');
var randomstring = require('randomstring');
//var nodemailer = require('nodemailer);
var jade = require('jade');
var express = require('express');
var mysql = require('mysql');
var port = process.env.PORT;
var connection = mysql.createConnection({
    host:'y2w3wxldca8enczv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user:'azz7jffn0urcif6x',
    password:'wpz8xszh05w0qnlj',
    database:'uuxwohaffbf52m9h'
});
console.log("Connected to database");
var app = express();
app.configure(function(){
    app.use(express.bodyParser());
    app.use(app.router);
});
//The port number of the c9 platform is process.env.PORT
//On the computer, it's localhost and not process.env.PORT
app.set('view engine', 'jade');
app.set('views', __dirname);
app.get('/', function(req, res){
    res.render('signupnew.jade');
    //jade.renderFile('signup.jade', {"username":"", "password":""});
});
var userid = String(randomstring.generate('32'));
//When user signs in correctly...
app.post('/signin', function(req, res){
    console.log(userid);
    console.log('Rendering jade file');
    res.render('signin.jade');
    console.log('Connecting to database');
    //connection.connect();
    console.log('Storing information');
    console.log("Email:", req.body.email);
    console.log("Password:", req.body.pass1);
    console.log("Username:", req.body.username);
    console.log("Age:", req.body.age);
    var decryptedpassword = sjcl.decrypt("password123", req.body.pass1);
    console.log('password has been decrypted');
    //POSSIBLY USEFUL INFORMATION: req.body.pass2 contains encrypted data and pass1 npw contains the unencrypted data
    //connection.query('INSERT INTO users(username, email, userpassword, age) VALUES('+ req.body.username + ', '+ req.body.email +', '+ req.body.pass1 +', '+ req.body.age + ')', function(err, rows){
    //var query = 'INsSERT INTO users(username, email, age) VALUES("'+ req.body.username + '", "'+ req.body.email +'", "'+ req.body.age + '")';
    //console.log(query);
    connection.query('INSERT INTO users(username, email,password,  age, id) VALUES("'+ req.body.username + '", "'+ req.body.email +'", "'+ decryptedpassword + '", "'+ req.body.age + '","'+ userid +'")', function(err, rows){
        if(err){
            console.error(err);
        }
        console.log(rows);
    });
    console.log("Account information has been stored in database");
    var email = jade.renderFile('emailsent.jade', {"username": String(req.body.username), "email": String(req.body.email), "password": String(decryptedpassword), "id": String(userid)});
    console.log(userid);
    //var template = fs.readFileSync('./emailsent.jade', 'utf-8');
    //var compiledTemplate = jade.compile(template);
    //The api key: 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
    var sendgrid = require("sendgrid")("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");
    sendgrid.send({
        to: req.body.email,
        from: "shlokhacks@gmail.com",
        subject: "Please verify your account: urtodos",
        html: email
    });
});

app.post('/home', function(req, res){
     var username  = req.body.username ;
     var password = req.body.password ;
     connection.query('SELECT * from users WHERE username="'+username+'" ', function(err, rows){
        var account = true;
        var respond = "";
        console.log(rows);
        if(err){
            console.error(err);
        }
        if(rows == 0){
            respond += ("You do not have an account. Please sign up to continue.");
            account = false ;
        }
        else{
            respond += ("You have an account");
            if(rows[0].password  == password){
                respond += (" Your passwords match!");
            }
            else{
                respond += (" Your passwords don't seem to match!");
                account = false;
            }
            if(rows[0].email_verify == 1){
                respond += (" You verified your email");
            }
            else{
                respond += (" You forgot to verify your account. Please check your email and verify your account");
                account = false;
            }
        }
        if(account ==  true){
            var item = [];
            connection.query('SELECT * FROM todos WHERE user = "'+username+'" AND date_deleted = "..."', function(err, rows){
                if(err){
                }
                else{
                    for(var i = 0; i<rows.length; i++){
                        var todo = rows[i]['todo'];
                        var id = rows[i]['id'];
                        item.push({
                            key : String(todo) ,
                            value : String(id)
                        });
                    }
                   //console.log("item " + JSON.stringify(item));
                }
                res.render('list.jade', {username : String(username), todo : String(JSON.stringify(item))});
            });
            //res.render('list.jade', {username : Stsring(username), todo : JSON.stringify(item)});
        }
        else{
            res.render('signin.jade', {username : String(username), password : String(password), message: String(respond) });
        }
    });
});
app.post('/usernameinfo', function(req, res){
    var username = (req.body.username);
    connection.query('SELECT username from users WHERE username ="'+username+'" ', function(err, rows){
       //console.log(rows);                                       
        if(err){
            console.error(err);
        }
        if(rows == 0){
           console.log('username is not taken');
           res.send('no');
            //Good username is not taken
        }
        else{
            console.log('username is taken');
            res.send('yes');
            //Uh Oh username has already been taken
        }
    });
});
app.post('/newtodoitem', function(req, res){
    var username = req.body.username;
    var todo = req.body.todo;
    var userid = req.body.id;
    console.log('New item');
    console.log(username, todo);
    connection.query('INSERT INTO todos(todo, user, date_made, id, date_deleted) VALUES("'+ todo + '", "'+ username +'", "'+ new Date() + '","' + userid + '","...")', function(err,rows){
        if(err){
            console.error(err);
        }
        else{
            console.log(rows);
        }
    });
   res.render('list.jade', {username : String(username)});
});
//app.set('view engine','jade');
app.post('/history', function(req, res){
    console.log("Username: " + req.body.username);
    console.log('Todo history button detected');
    console.log('aa' + req.body.username + 'aa');
    connection.query('SELECT * FROM todos WHERE user = "'+ req.body.username +'"', function(err, rows){
       if(err){
           console.error(err);
       }
       else{
           //console.log(rows);
           var finallist = [];
           for(var i = 0; i<(rows.length);i++){
               var todo = rows[i]['todo'];
               var date_made = rows[i]['date_made'];
               var date_deleted = rows[i]['date_deleted'];
               finallist.push(String(todo),String(date_made),String(date_deleted));
           }
           console.log(finallist);
           res.render('todohistory.jade', {list: JSON.stringify(finallist), username: String(req.body.username)});
       }
    });
    /*res.render('todohistory.jade',function(err,html){
        if(err){
            console.log('error ' + err);
        }
        else{
            res.render('todohistory.jade');
        }
    });
    */
    //res.render('todohistory.jade');
    
});

app.post('/deleteitem',function(req, res){
   var htmlid = (req.body.id);
   var htmltodo = (req.body.dtodo);
   console.log(req.body.username ,htmltodo, htmlid);
   /*htmltodo = htmltodo.slice(7,htmltodo.length-5);
   var id = htmltodo.split('>')[0];
   id = id.replace(/^"(.*)"$/, '$1');
   var todo = htmltodo.replace(String(id), "");
   todo = todo.substr(3lo-0i9 h
   console.log(req.body.username, id, htmltodo);
   */
   connection.query('UPDATE todos SET date_deleted = "'+new Date()+'" WHERE user = "'+req.body.username+'" AND todo = "'+ htmltodo +'" AND id = "'+ htmlid +'" LIMIT 1', function(err, rows){
       if(err){
           console.error(err);
       }
       else{
           console.log(rows);
       }
   });
   res.render('list.jade', {username: String(req.body.username)});
});
app.get('/verifyemail', function(req, res){
    connection.query('UPDATE users SET email_verify = 1 WHERE id = ?', [ req.query.id], function(err, rows){
        if(err){
            console.error(err);
        }
        else{
            console.log(rows);
        }
    });
    //res.redirect('https://www.google.com/');
    res.render('signin.jade');
});
app.post('/todos', function(req,res){
    console.log(req.body.username);
    var item = [];
    connection.query('SELECT * from todos where user = "'+req.body.username+'" AND date_deleted = "..."', function(err, rows){
        if(err){
            console.error(err);
        }
        else{
            for(var i = 0; i < rows.length; i++){
                var todo = rows[i]['todo'];
                var id = rows[i]['id'];
                console.log(todo,id);
                item.push({
                    key : String(todo) ,
                    value : String(id)
                });
            }
            res.render('list.jade', {username : String(req.body.username), todo : String(JSON.stringify(item))});
        }
    });
});
app.get('/signinpage', function(req, res){
    res.render('signin.jade');
});
app.get('/signuppage', function(req, res){
    res.render('signupnew.jade');
});
//If you change the url so that the domain is /secretpage on the website you are able to see all the user accounts and passwords plus ids...
app.get('/secretpage', function(req, res){
    connection.query('SELECT * from users', function(err, rows){
       if(err){
           console.error(err);
       }
       console.log(rows);
       res.send(rows);
    });
});
//The following must always be last route to handle page npt found(404) error
app.get('*', function(req, res){
   res.status(404);
   res.render('pagenotfound'); 
});
app.listen(port);