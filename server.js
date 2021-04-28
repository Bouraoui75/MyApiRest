// Imports 
var express = require('express');
var bodyParser = require('body-parser');
var apiRouter = require('./apiRouter').router;

// Instantiate server 
var server = express();

// Body Parser configuration
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

//configure routes
server.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send('<h1>Bonjour bienvenue sur mon serveur</h1>');
});

server.use('/api/', apiRouter);

// Launch server 
server.listen(9900, function() {
    console.log('Server en écoute :)')
});