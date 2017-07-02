var express = require('express');
var bcrypt = require('bcrypt')
var router = express.Router();

router.post('/add', function (req, res, next) {
    // var json = JSON.parse(req)
    //console.log(req.body)
    var sess = req.session
    if (sess.uid == undefined || sess.uid == null) {
        //console.log(sess.uid)
        res.json({"message": "You are not currently logged in"})
    } else if (req.body.num1 == undefined || req.body.num2 == undefined) {
        res.json({"message": "The numbers you entered are not valid"})
    } else if (isNaN(req.body.num1) || isNaN(req.body.num2)) {
        res.json({"message": "The numbers you entered are not valid"})
    } else {
        res.json({"message": "The action was successful", "result": parseInt(req.body.num1) + parseInt(req.body.num2)})

    }
});
router.post('/divide', function (req, res, next) {
    // var json = JSON.parse(req)
    var sess = req.session
    if (sess.uid == undefined || sess.uid == null) {
        //console.log(sess.uid)
        res.json({"message": "You are not currently logged in"})
    } else if (req.body.num1 == undefined || req.body.num2 == undefined) {
        res.json({"message": "The numbers you entered are not valid"})
    } else if (isNaN(req.body.num1) || isNaN(req.body.num2)) {
        res.json({"message": "The numbers you entered are not valid"})

    } else if (parseInt(req.body.num2) == 0) {
        res.json({"message": "The numbers you entered are not valid"})
    } else {
        res.json({"message": "The action was successful", "result": parseInt(req.body.num1) / parseInt(req.body.num2)})

    }
});
router.post('/multiply', function (req, res, next) {
    // var json = JSON.parse(req)
    var sess = req.session
    if (sess.uid == undefined || sess.uid == null) {
        //console.log(sess.uid)
        res.json({"message": "You are not currently logged in"})
    } else if (req.body.num1 == undefined || req.body.num2 == undefined) {
        res.json({"message": "The numbers you entered are not valid"})
    } else if (isNaN(req.body.num1) || isNaN(req.body.num2)) {
        res.json({"message": "The numbers you entered are not valid"})
    } else {
        res.json({"message": "The action was successful", "result": parseInt(req.body.num1) * parseInt(req.body.num2)})

    }
});

router.post('/login', function (req, res, next) {
    var mysql = require('mysql');
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'my_db'
    });

    connection.connect();
    var statementsql = "SELECT * FROM users where username=" + "'" + req.body.username + "'";
    //console.log(statementsql)
    connection.query(statementsql, function (error, results, fields) {
        if (error) {
            throw error
        }
        ;
        //console.log('The solution is: ', results)
        bcrypt.compare(req.body.password, results[0].password, function (err, resp) {
            if (resp == true) {
                var sess = req.session
                sess.uid = req.body.username
                res.session = sess
                res.json({"message": "Welcome " + results[0].firstName})
            }
            else {
                req.session = null
                // req.session.destroy(function (err) {
                //     if (err) throw error;
                // })
                res.json({"message": "There seems to be an issue with the username/password combination that you entered"})
            }
        })
    });

    connection.end();

});
router.post('/logout', function (req, res, next) {
    var sess = req.session
    if (sess.uid == undefined || sess.uid == null) {
        // console.log(sess.uid)
        res.json({"message": "You are not currently logged in"})
    } else {
        req.session = null
        res.json({"message": "You have been successfully logged out"});
    }
});

router.post('/register', function (req, res, next) {
    bcrypt.hash(req.body.password, 10, function (err, hash) {
        var mysql = require('mysql');
        var connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'password',
            database: 'my_db'
        });
        connection.connect();
        //console.log([req.body.username, hash, req.body.firstName,req.body.lastName])
        var myparams = [req.body.username, hash, req.body.firstName, req.body.lastName]
        var statementsql = "insert into users values(" + "'" + req.body.username + "'," + "'" + hash + "'," + "'" + req.body.firstName + "'," + "'" + req.body.lastName + "')";
        //console.log(statementsql)

        connection.query(statementsql, function (error, results) {
            if (error) {
                console.log(error)
                throw error;
            }
            //console.log('added');
        });

        connection.end();
    });
    res.json({"message": "registered!!"})
})

module.exports = router;
