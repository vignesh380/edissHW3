var express = require('express');
var bcrypt = require('bcrypt')
var router = express.Router();
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var mysql = require('mysql');


var pool = mysql.createPool({
    connectionLimit: 1000,
    host: 'ec2-54-175-243-243.compute-1.amazonaws.com',
    port: '3306',
    user: 'root',
    password: 'password',
    database: 'my_db',
    debug: false
});

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

router.post('/health', function (req, res, next) {
    res.json({"health": "asdfsadf"});
});
router.get('/health', function (req, res, next) {
    res.json({"health": "asdfsadf"});
});

router.post('/login', function (req, res, next) {
    var statementsql = "SELECT * FROM user_info where username=" + "'" + req.body.username + "'";

    pool.getConnection(function (err, connection) {
        if (err) {

            throw err;
        }
        connection.query(statementsql, function (error, results, fields) {
            connection.release();
            if (error) {
                res.json({"message": "There seems to be an issue with the username/password combination that you entered"})
                error = null
            } else if (results.length == 0) {
                res.json({"message": "There seems to be an issue with the username/password combination that you entered"})
            } else {
                //console.log('The solution is: ', results)
                bcrypt.compare(req.body.password, results[0].password, function (err, resp) {
                    if (resp == true) {
                        var sess = req.session;
                        sess.uid = req.body.username;
                        console.log("role!!!!!!!")
                        console.log(results[0].role)
                        sess.role = results[0].role;
                        res.session = sess
                        res.json({"message": "Welcome " + results[0].fname})
                    }
                    else {
                        req.session = null
                        // req.session.destroy(function (err) {
                        //     if (err) throw error;
                        // })
                        res.json({"message": "There seems to be an issue with the username/password combination that you entered"})
                    }
                })
            }
        });
        connection.on('error', function (err) {
            console.log(err);
            return;
        });
    });
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

        //console.log([req.body.username, hash, req.body.firstName,req.body.lastName])
        var myparams = [req.body.username, hash, req.body.firstName, req.body.lastName]
        var statementsql = "insert into users values(" + "'" + req.body.username + "'," + "'" + hash + "'," + "'" + req.body.firstName + "'," + "'" + req.body.lastName + "');";
        //console.log(statementsql)
        pool.getConnection(function (err, connection) {
            if (err) {
                connection.release();
                throw err;
            }
            connection.query(statementsql, function (error, results) {
                connection.release()
                if (error) {
                    console.log(error)
                    throw error;
                }
                //console.log('added');
            });
            connection.on('error', function (err) {
                console.log(err);
                return;
            });
        });

    });
    res.json({"message": "registered!!"})
})

router.post('/registerUser', function (req, res, next) {
    bcrypt.hash(req.body.password, 10, function (err, hash) {

        console.log("bcrypt done")

        //console.log([req.body.username, hash, req.body.firstName,req.body.lastName])
        checkParameters(req, res, function (paramsError) {
            console.log(paramsError)
            if (paramsError != null) {
                res.json({"message": "The input you provided is not valid"});
            } else {
                var userRole = "customer"
                var sqlstatement = "INSERT INTO `my_db`.`user_info` (`username`, `password`, `fname`, `lname`, `address`, `city`, `state`, `email`, `zip`,`role`) VALUES (" + "'" + req.body.username + "'," + "'" + hash + "'," + "'" + req.body.fname + "'," + "'" + req.body.lname + "'," + "'" + req.body.address + "'," + "'" + req.body.city + "'," + "'" + req.body.state + "'," + "'" + req.body.email + "'," + "'" + req.body.zip + "'," + "'" + userRole + "');"
                pool.getConnection(function (err, connection) {
                    if (err) {
                        connection.release();
                        throw err;
                    }
                    connection.query(sqlstatement, function (error, results) {
                        connection.release()
                        if (error) {
                            if (error.type == "ER_DUP_ENTRY") {
                                res.json({"message": "The input you provided is not valid"})
                            } else {
                                res.json({"message": "The input you provided is not valid"})
                            }
                            error = null

                        } else {
                            res.json({"message": req.body.fname + " was registered successfully"});
                        }
                    });
                    connection.on('error', function (err) {
                        console.log(err);
                        return;
                    });
                });

            }
        });
    });
})

router.post('/registerAdmin', function (req, res, next) {
    bcrypt.hash(req.body.password, 10, function (err, hash) {
        console.log("bcrypt done")
        checkParameters(req, res, function (paramsError) {
            console.log(paramsError)
            if (paramsError != null) {
                res.json({"message": "The input you provided is not valid"});
            } else {
                var userRole = "admin"
                var sqlstatement = "INSERT INTO `my_db`.`user_info` (`username`, `password`, `fname`, `lname`, `address`, `city`, `state`, `email`, `zip`,`role`) VALUES (" + "'" + req.body.username + "'," + "'" + hash + "'," + "'" + req.body.fname + "'," + "'" + req.body.lname + "'," + "'" + req.body.address + "'," + "'" + req.body.city + "'," + "'" + req.body.state + "'," + "'" + req.body.email + "'," + "'" + req.body.zip + "'," + "'" + userRole + "');"

                pool.getConnection(function (err, connection) {
                    if (err) {
                        console.log(err);
                    }
                    connection.query(sqlstatement, function (error, results) {
                        connection.release()
                        if (error) {
                            if (error.type == "ER_DUP_ENTRY") {
                                res.json({"message": "The input you provided is not valid"})
                            } else {
                                res.json({"message": "The input you provided is not valid"})
                            }
                            error = null

                        } else {
                            res.json({"message": req.body.fname + " was registered successfully"});
                        }
                    });
                    connection.on('error', function (err) {
                        console.log(err);
                        return;
                    });
                });
            }
        });
    });
})


router.post('/updateInfo', function (req, res, next) {
    var sess = req.session
    if (sess.uid == undefined || sess.uid == null) {
        // console.log(sess.uid)
        res.json({"message": "You are not currently logged in"})
    } else {
        bcrypt.hash(req.body.password, 10, function (err, hash) {
            console.log("bcrypt done")

            //console.log([req.body.username, hash, req.body.firstName,req.body.lastName])
            checkParameters(req, res, function (paramsError) {
                console.log(paramsError)
                if (paramsError != null) {
                    res.json({"message": "The input you provided is not valid"});
                } else {

                    var myparams = [req.body.username, hash, req.body.fname, req.body.lastName]
                    var userRole = "customer"
                    var sqlstatement = "UPDATE user_info SET `username`=" + "'" + req.body.username + "'," + "`password`=" + "'" + hash + "'," + " `fname`=" + "'" + req.body.fname + "'," + " `lname`=" + "'" + req.body.lname + "'," + " `address`=" + "'" + req.body.address + "'," + " `city`=" + "'" + req.body.city + "'," + " `state` = " + "'" + req.body.state + "'," + " `email` = " + "'" + req.body.email + "'," + " `zip` = " + "'" + req.body.zip + "'," + "`role`=" + "'" + userRole + "' WHERE `username`=" + "'" + req.body.username + "';";
                    var sqlstatementPart = "UPDATE user_info SET `username`=" + "'" + req.body.username;

                    if (req.body.fname != null || req.body.fname != undefined) {
                        sqlstatementPart = sqlstatementPart + "'," + " `fname`=" + "'" + req.body.fname
                    }
                    if (req.body.lname != null || req.body.lname != undefined) {
                        sqlstatementPart = sqlstatementPart + "'," + " `lname`=" + "'" + req.body.lname
                    }
                    if (req.body.address != null || req.body.address != undefined) {
                        sqlstatementPart = sqlstatementPart + "'," + " `address`=" + "'" + req.body.address
                    }
                    if (req.body.city != null || req.body.city != undefined) {
                        sqlstatementPart = sqlstatementPart + "'," + " `city`=" + "'" + req.body.city
                    }
                    if (req.body.state != null || req.body.state != undefined) {
                        sqlstatementPart = sqlstatementPart + "'," + " `state` = " + "'" + req.body.state
                    }
                    if (req.body.email != null || req.body.email != undefined) {
                        sqlstatementPart = sqlstatementPart + +"'," + " `email` = " + "'" + req.body.email
                    }
                    if (req.body.zip != null || req.body.zip != undefined) {
                        sqlstatementPart = sqlstatementPart + "," + " `zip` = " + "'" + req.body.zip
                    }
                    if (req.body.productName != null || req.body.productName != undefined) {
                        sqlstatementPart = sqlstatementPart + "'," + "`productName`=" + "'" + req.body.productName
                    }
                    if (req.body.productName != null || req.body.productName != undefined) {
                        sqlstatementPart = sqlstatementPart + "'," + "`productName`=" + "'" + req.body.productName
                    }
                    if (req.body.productName != null || req.body.productName != undefined) {
                        sqlstatementPart = sqlstatementPart + "'," + "`productName`=" + "'" + req.body.productName
                    }
                    if (req.body.productName != null || req.body.productName != undefined) {
                        sqlstatementPart = sqlstatementPart + "'," + "`productName`=" + "'" + req.body.productName
                    }
                    sqlstatementPart = sqlstatementPart + "' WHERE `username`=" + "'" + req.body.username + "';"
                    pool.getConnection(function (err, connection) {
                        if (err) {
                            connection.release();
                            throw err;
                        }
                        connection.query(sqlstatementPart, function (error, results) {
                            connection.release()
                            if (error) {
                                if (error.type == "ER_DUP_ENTRY") {
                                    //res.status(400);
                                    res.json({"message": "The input you provided is not valid"})
                                } else {
                                    //res.status(400);
                                    res.json({"message": "The input you provided is not valid"})
                                }
                                error = null

                            } else {
                                res.json({"message": req.body.fname + " your information was successfully updated"});
                            }
                        });
                        connection.on('error', function (err) {
                            console.log(err);
                            return;
                        });
                    });
                }
            });
        });
    }
})

router.post('/addProducts', function (req, res, next) {
    var sess = req.session
    console.log(sess.role);
    if (sess.uid == undefined || sess.uid == null) {
        res.json({"message": "You are not currently logged in"})
    } else if (sess.role == undefined || sess.role == null || sess.role != "admin") {
        res.json({"message": "You must be an admin to perform this action"})
    } else {

        console.log("bcrypt done")
        checkProductParameters(req, res, function (paramsError) {
            console.log(paramsError)
            if (paramsError != null) {
                res.json({"message": "The input you provided is not valid"});
            } else {
                pool.getConnection(function (err, connection) {
                    if (err) {
                        connection.release();
                        throw err;
                    }
                    connection.query(statementsql, function (error, results) {
                        connection.release()
                        if (error) {
                            // console.log(error);
                            if (error.type == "ER_DUP_ENTRY") {
                                //res.status(400);
                                res.json({"message": "The input you provided is not valid"})
                            } else {
                                //res.status(400);
                                res.json({"message": "The input you provided is not valid"})
                            }
                            error = null

                        } else {
                            console.log(req.body)
                            res.json({"message": req.body.productName + " was successfully added to the system"});
                        }
                    });
                    connection.on('error', function (err) {
                        console.log(err);
                        return;
                    });
                });
                var statementsql = "insert into product_catalog values(" + "'" + req.body.asin + "'," + "'" + req.body.productName + "'," + "'" + req.body.productDescription + "'," + "'" + req.body.group + "')";
                console.log(statementsql)
            }
        });
    }
});

router.post('/modifyProduct', function (req, res, next) {
    var sess = req.session
    if (sess.uid == undefined || sess.uid == null) {
        // console.log(sess.uid)
        //res.status(400);
        res.json({"message": "You are not currently logged in"})
    } else if (sess.role == undefined || sess.role == null || sess.role != "admin") {
        //res.status(400);
        res.json({"message": "You must be an admin to perform this action"})
    } else {
        console.log("bcrypt done")
        checkProductParameters(req, res, function (paramsError) {
            console.log(paramsError)
            if (paramsError != null) {
                //res.status(400);
                res.json({"message": "The input you provided is not valid"});
            } else {
                var sqlstatement = "UPDATE product_catalog SET `asin`=" + "'" + req.body.asin + "'," + "`productName`=" + "'" + req.body.productName + "'," + " `productDescription`=" + "'" + req.body.productDescription + "'," + " `productGroup`=" + "'" + req.body.group + "' WHERE `asin`=" + "'" + req.body.asin + "';";
                var sqlstatementPart = "UPDATE product_catalog SET `asin`=" + "'" + req.body.asin;
                if (req.body.productName != null || req.body.productName != undefined) {
                    sqlstatementPart = sqlstatementPart + "'," + "`productName`=" + "'" + req.body.productName
                }
                if (req.body.productDescription != null || req.body.productDescription != undefined) {
                    sqlstatementPart = sqlstatementPart + "'," + " `productDescription`=" + "'" + req.body.productDescription
                }
                if (req.body.group != null || req.body.group != undefined) {
                    sqlstatementPart = sqlstatementPart + "'," + " `productGroup`=" + "'" + req.body.group
                }
                sqlstatementPart = sqlstatementPart + "' WHERE `asin`=" + "'" + req.body.asin + "';";
                pool.getConnection(function (err, connection) {
                    if (err) {
                        connection.release();
                        throw err;
                    }
                    connection.query(sqlstatementPart, function (error, results) {
                        connection.release()
                        if (error) {
                            // console.log(error);
                            if (error.type == "ER_DUP_ENTRY") {
                                //res.status(400);
                                res.json({"message": "The input you provided is not valid"})
                            } else {
                                //res.status(400);
                                res.json({"message": "The input you provided is not valid"})
                            }
                            error = null

                        } else {
                            res.json({"message": req.body.productName + " was successfully updated"});
                        }
                    });
                    connection.on('error', function (err) {
                        console.log(err);
                        return;
                    });
                });
            }
        });
    }
})


router.post('/viewUsers', function (req, res, next) {
    var sess = req.session
    if (sess.uid == undefined || sess.uid == null) {
        //res.status(400);
        res.json({"message": "You are not currently logged in"})
    } else if (sess.role == undefined || sess.role == null || sess.role != "admin") {
        // res.status(400);
        res.json({"message": "You must be an admin to perform this action"})
    } else {

        var fnameWhere = null
        var lnameWhere = null
        if (req.body.fname != null || req.body.fname != undefined) {
            fnameWhere = "fname LIKE '%" + req.body.fname + "%'";
        }
        if (req.body.lname != null || req.body.lname != undefined) {
            lnameWhere = "lname LIKE '%" + req.body.lname + "%'";
        }
        var sqlstatement = "Select fname,lname,username from user_info";
        if (fnameWhere != null || lnameWhere != null) {
            sqlstatement = sqlstatement + " Where ";
        }
        if (fnameWhere != null) {
            sqlstatement = sqlstatement + fnameWhere;
        }
        if (fnameWhere != null && lnameWhere != null) {
            sqlstatement = sqlstatement + " and ";
        }
        if (lnameWhere != null) {
            sqlstatement = sqlstatement + lnameWhere;
        }
        pool.getConnection(function (err, connection) {
            if (err) {
                connection.release();
                throw err;
            }
            connection.query(sqlstatement, function (error, results) {
                connection.release()
                if (error) {
                    console.log(error);
                    if (error.type == "ER_DUP_ENTRY") {
                        //res.status(400);
                        res.json({"message": "The input you provided is not valid"})
                    } else {
                        //res.status(400);
                        res.json({"message": "The input you provided is not valid"})
                    }
                    error = null
                } else {
                    if (results.length == 0) {
                        res.json({"message": "There are no users that match that criteria"})
                    } else {
                        results = JSON.parse(JSON.stringify(results).split('"username":').join('"userId":'));
                        res.json({"message": "The action was successful", "user": results});
                    }
                }
            });
            connection.on('error', function (err) {
                console.log(err);
                return;
            });
        });
    }
})


router.post('/viewProducts', function (req, res, next) {

    var asinWhere = null
    var keywordWhere = null
    var groupWhere = null
    if (req.body.asin != null || req.body.asin != undefined) {
        asinWhere = "asin LIKE '%" + req.body.asin + "%'";
    }
    if (req.body.keyword != null || req.body.keyword != undefined) {
        keywordWhere = "productName LIKE '%" + req.body.keyword + "%'";
    }
    if (req.body.group != null || req.body.group != undefined) {
        groupWhere = "productGroup LIKE '%" + req.body.group + "%'";
    }
    var sqlstatement = "Select asin,productName from product_catalog";
    if (asinWhere != null || keywordWhere != null || groupWhere != null) {
        sqlstatement = sqlstatement + " Where ";
    }
    if (asinWhere != null) {
        sqlstatement = sqlstatement + asinWhere;
    }
    if (asinWhere != null && keywordWhere != null) {
        sqlstatement = sqlstatement + " and ";
    }
    if (keywordWhere != null) {
        sqlstatement = sqlstatement + keywordWhere;
    }
    if (keywordWhere != null && groupWhere != null) {
        sqlstatement = sqlstatement + " and ";
    }
    if (groupWhere != null) {
        sqlstatement = sqlstatement + groupWhere;
    }
    console.log(sqlstatement);
    pool.getConnection(function (err, connection) {
        if (err) {
            connection.release();
            throw err;
        }
        connection.query(sqlstatement, function (error, results) {
            connection.release()
            if (error) {
                // console.log(error);
                if (error.type == "ER_DUP_ENTRY") {
                    //res.status(400);
                    res.json({"message": "The input you provided is not valid"})
                } else {
                    //res.status(400);
                    res.json({"message": "The input you provided is not valid"})
                }
                error = null
            } else {
                if (results.length == 0) {
                    res.json({"message": "There are no products that match that criteria"})
                } else {
                    results = JSON.parse(JSON.stringify(results).split('"username":').join('"userId":'));
                    res.json({"product": results});
                }
            }
        });
        connection.on('error', function (err) {
            console.log(err);
            return;
        });
    });

})

function checkParameters(req, res, callback) {
    var message = null;
    console.log("callback called")
    if (req.body.username == null || req.body.username == "") {
        message = "username is null"
    }
    if (req.body.password == null || req.body.password == "") {
        message = "password is null"
    }
    if (req.body.fname == null || req.body.fname == "") {
        message = "firstName is null"
    }
    if (req.body.lname == null || req.body.lname == "") {
        message = "lastName is null"
    }
    if (req.body.address == null || req.body.address == "") {
        message = "address is null"
    }
    if (req.body.city == null || req.body.city == "") {
        message = "city is null"
    }
    if (req.body.state == null || req.body.state == "") {
        message = "state is null"
    }
    if (req.body.email == null || req.body.email == "") {
        message = "email is null"
    }
    if (req.body.zip == null || req.body.zip == "") {
        message = "zip is null"
    }
    // if (req.body.role == null || req.body.role == "") {
    //     message = "role is null"
    // }
    callback(message);
}

function checkProductParameters(req, res, callback) {
    var message = null;
    if (req.body.asin == null || req.body.asin == "") {
        message = "username is null"
    }
    if (req.body.productName == null || req.body.productName == "") {
        message = "productName is null"
    }
    if (req.body.productDescription == null || req.body.productDescription == "") {
        message = "productDescription is null"
    }
    if (req.body.group == null || req.body.group == "") {
        message = "group is null"
    }
    callback(message);
}

module.exports = router;
