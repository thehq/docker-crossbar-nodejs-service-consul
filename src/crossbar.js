var autobahn = require('autobahn');
var config = require('./config.js');

var crossbar = {};

crossbar.connection = null;
crossbar.connected = false;

crossbar.connect = function(callback) {
    if (crossbar.connected == true) {
        return;
    }

    var options = {
        url: config.XBAR_URL,
        realm: config.XBAR_REALM
    }

    // Setup authentication if credentials were set
    if (config.XBAR_USER != null && config.XBAR_USER.length != 0) {
        options.authmethods = ["wampcra"];
        options.authid = config.XBAR_USER;
        options.onchallenge = function(session, method, extra) {
            if (method === "wampcra") {
                return autobahn.auth_cra.sign(config.XBAR_SECRET, extra.challenge);
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
    if (!crossbar.connected) {
        return;
    }

    crossbar.session.close();
    crossbar.session = null;
};

module.exports = crossbar;