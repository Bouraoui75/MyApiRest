// Imports
var express = require('express')
var usersCtrl = require('./routes/usersCtrl')

// Router
exports.router = (function() {
    var apiRouter = express.Router();

    // Users Routes
    apiRouter.route('/users/register/').post(usersCtrl.register);
    apiRouter.route('/users/login/').post(usersCtrl.login);
    apiRouter.route('/users/me/:id').get(usersCtrl.getUserProfile);
    apiRouter.route('/users/update/:id').put(usersCtrl.updateUserProfile);
    apiRouter.route('/users/delete/:id').delete(usersCtrl.deleteUserProfile);
    apiRouter.route('/users/all/').get(usersCtrl.allUserProfile);


    return apiRouter;
})();