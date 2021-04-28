'use strict';
module.exports = (sequelize, DataTypes) => {
  var User =sequelize.define('User', {
    lastname: DataTypes.STRING, 
    firstname: DataTypes.STRING,
    email: DataTypes.STRING, 
    password: DataTypes.STRING, 
    isAdmin: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate:function(models) {
        models.User.hasMany(models.Message)
      }
    }
  });
  return User;
};