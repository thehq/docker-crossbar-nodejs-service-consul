var autobahn = require('autobahn');
var fs = require('fs');
var config = require('./config.json');

var crossbar = {};

crossbar.connection = null;
crossbar.connected = false;

crossbar.connect = function(callback) {
    if (crossbar.connected == true) {
        return;
    }

    var user = process.env.ROUTER_AUTH_USER;
    var secret = process.env.ROUTER_AUTH_SECRET;

    if (config.url == null) {
        return;
    }

    console.log("Connecting to '"+crossbar.url+"', realm '"+crossbar.realm+"'");

    var options = {
        url: config.url,
        realm: config.realm
    }

    // Setup authentication if credentials were set
    if (user != null && user.length != 0) {
        options.authmethods = ["wampcra"];
        options.authid = user;
        options.onchallenge = function(session, method, extra) {
            if (method === "wampcra") {
                return autobahn.auth_cra.sign(secret, extra.challenge);
            }
        };
    }

    crossbar.connection = new autobahn.Connection(options);

    crossbar.connection.onopen = function (session, details) {
        console.log("Connected to Router.");
        crossbar.connected = true;
        callback(crossbar.connected);
    };

    crossbar.connection.onclose = function (session, details) {
        console.log("Disconnected from Router.");
        console.log(details);
        crossbar.connected = false;
        callback(crossbar.connected);
    };

    crossbar.connection.open();
};

crossbar.disconnect = function() {
    if (!crossbar.connection) {
        return;
    }

    crossbar.connection.close();
    crossbar.connection = null;
    crossbar.connected = false;
};

module.exports = crossbar;