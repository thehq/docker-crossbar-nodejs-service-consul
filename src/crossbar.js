var autobahn = require('autobahn');
var fs = require('fs');

var crossbar = {};

crossbar.connection = null;
crossbar.connected = false;
crossbar.url = null;
crossbar.realm = null;
crossbar.callback = null;

crossbar.connect = function(callback) {
    if (crossbar.connected == true) {
        return;
    }

    crossbar.callback = callback;
    var user = process.env.ROUTER_AUTH_USER;
    var secret = process.env.ROUTER_AUTH_SECRET;

    if (crossbar.url == null) {
        return;
    }

    console.log("Connecting to '"+crossbar.url+"', realm '"+crossbar.realm+"'");

    var options = {
        url: crossbar.url,
        realm: crossbar.realm
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
    crossbar.session = null;
    crossbar.connected = false;
};

// Periodic timer to check for change in config
setInterval(function() {
    // Open the config file
    var config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

    if (config.url == crossbar.url) {
        // Do Nothing
        return
    }
    else {
        console.log("Config: Change Detected");
        console.log(config);

        crossbar.disconnect();
        crossbar.url = null;
        crossbar.realm = null;

        if (config.url != null) {
            console.log("Config: Reconnecting");
            crossbar.url = config.url;
            crossbar.realm = config.realm;
            crossbar.connect(crossbar.callback);
        }
    }
}, 1000);

module.exports = crossbar;