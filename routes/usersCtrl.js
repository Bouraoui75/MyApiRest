// imports 
var bcrypt = require('bcrypt');
var jwtUtils = require('../utils/jwt.utils')
var models = require('../models');
var asyncLib = require('async');

// Constants
const EMAIL_REGEX     = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX  = /^(?=.*\d).{4,8}$/;


// Routes
module.exports = {
    register : function(req, res) {
        
        // Params
        var email = req.body.email;
        var lastname = req.body.lastname;
        var firstname = req.body.firstname;
        var password = req.body.password;

        if (email == null || lastname == null || firstname == null || password == null) {
            return res.status(400).json({ 'error': 'missing parameters'});
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ 'error': 'email is not valid' });
          }
      
          if (!PASSWORD_REGEX.test(password)) {
            return res.status(400).json({ 'error': 'password invalid (must length 4 - 8 and include 1 number at least)' });
          }

          asyncLib.waterfall([
            function(done) {
              models.User.findOne({
                attributes: ['email'],
                where: { email: email }
              })
              .then(function(userFound) {
                done(null, userFound);
              })
              .catch(function(err) {
                return res.status(500).json({ 'error': 'unable to verify user' });
              });
            },
            function(userFound, done) {
              if (!userFound) {
                bcrypt.hash(password, 5, function( err, bcryptedPassword ) {
                  done(null, userFound, bcryptedPassword);
                });
              } else {
                return res.status(409).json({ 'error': 'user already exist' });
              }
            },
            function(userFound, bcryptedPassword, done) {
                var newUser = models.User.create({
                    email: email,
                    firstname: firstname,
                    lastname: lastname,
                    password: bcryptedPassword,
                    isAdmin: 0
                })
                .then(function(newUser) {
                  done(newUser);
                })
                .catch(function(err) {
                  return res.status(500).json({ 'error': 'cannot add user' });
                });
              }
            ], function(newUser) {
              if (newUser) {
                return res.status(201).json({
                  'userId': newUser.id
                });
              } else {
                return res.status(500).json({ 'error': 'cannot add user' });
              }
            });
          },
    

        // TODO verify first and last name length, mail regex , password etc .
  
    
    login : function(req, res) {

        //params 
        var email = req.body.email;
        var password = req.body.password;

        if (email == null || password == null) {
            return res.status(400).json({ 'error' : 'missing parameters '});
        }

        // TODO verify mail regex & password length.

        asyncLib.waterfall([
            function(done) {
              models.User.findOne({
                where: { email: email }
              })
              .then(function(userFound) {
                done(null, userFound);
              })
              .catch(function(err) {
                return res.status(500).json({ 'error': 'unable to verify user' });
              });
            },
            function(userFound, done) {
              if (userFound) {
                bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt) {
                  done(null, userFound, resBycrypt);
                });
              } else {
                return res.status(404).json({ 'error': 'user not exist in DB' });
              }
            },
            function(userFound, resBycrypt, done) {
              if(resBycrypt) {
                done(userFound);
              } else {
                return res.status(403).json({ 'error': 'invalid password' });
              }
            }
          ], function(userFound) {
            if (userFound) {
              return res.status(201).json({
                'userId': userFound.id,
                'token': jwtUtils.generateTokenForUser(userFound)
              });
            } else {
              return res.status(500).json({ 'error': 'cannot log on user' });
            }
          });
        },
        getUserProfile: function(req, res) {
            // Getting auth header
            var headerAuth  = req.headers['authorization'];
            var userId      = jwtUtils.getUserId(headerAuth);
        
            models.User.findOne({
              attributes: [ 'id' , 'lastname' , 'firstname' , 'email' ],
              where: { id: req.params.id }
            }).then(function(user) {
              if (user) {
                res.status(201).json(user);
              } else {
                res.status(404).json({ 'error': 'user not found' });
              }
            }).catch(function(err) {
              res.status(500).json({ 'error': 'cannot fetch user' });
            });
          },
          updateUserProfile: function(req, res) {
        
            // Params
            var lastname = req.body.lastname;
            var firstname = req.body.firstname;
            var email = req.body.email;
        
            asyncLib.waterfall([
              function(done) {
                models.User.findOne({
                  attributes: ['id' , 'lastname' , 'firstname' , 'email'],
                  where: { id : req.params.id }
                }).then(function (userFound) {
                  done(null, userFound);
                })
                .catch(function(err) {
                  return res.status(500).json({ 'error': 'unable to verify user' });
                });
              },
              function(userFound, done) {
                if(userFound) {
                  userFound.update({
                    lastname: (lastname ? lastname : userFound.lastname),
                    firstname: (firstname ? firstname : userFound.firstname),
                    email: (email ? email : userFound.email)
                  }).then(function() {
                    done(userFound);
                  }).catch(function(err) {
                    res.status(500).json({ 'error': 'cannot update user' });
                  });
                } else {
                  res.status(404).json({ 'error': 'user not found' });
                }
              },
            ], function(userFound) {
              if (userFound) {
                return res.status(201).json(userFound);
              } else {
                return res.status(500).json({ 'error': 'cannot update user profile' });
              }
            });

            
            
          },

          deleteUserProfile : function(req, res) {
        
            asyncLib.waterfall([
              (done) => {
                  models.User.findOne({
                      where : {id: req.params.id}
                  })
                  .then((userFound) => {
                      done(null, userFound);
                  })
                  .catch(function(err) {
                      return res.status(500).json({ 'error' : 'unable to verify user'});
                  });
              },
              (userFound, done) => {
                  if(userFound){
                      userFound.destroy({
                      })
                      .then((userFound) => {
                          done(null, userFound);
                      })
                      .catch((err) => {
                          return res.status(500).json({ 'error' : 'unable to destroy user'});
                      });
                  } else {
                      res.status(404).json({ 'error' : 'user not found'});
                  }
              }
          ],
          (userFound) => {
              if(!userFound){
                  return res.status(200).json({ 'message' : 'User successfully deleted'});
              } else {
                  return res.status(500).json({ 'error' : 'cannot delete user'});
              }


          });
            

        },
        
        allUserProfile: function(req, res) {
      
          models.User.findAll({
            attributes: [ 'id' , 'lastname' , 'firstname' , 'email' ],
          }).then(function(user) {
            if (user) {
              res.status(201).json(user);
            } else {
              res.status(404).json({ 'error': 'user not found' });
            }
          }).catch(function(err) {
            res.status(500).json({ 'error': 'cannot fetch user' });
          });
        },
        }
