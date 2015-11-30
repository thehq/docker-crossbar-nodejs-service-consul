var autobahn = require('autobahn');
var fs = require('fs');

var crossbar = {};

crossbar.connection = null;
crossbar.connected = false;
crossbar.url = null;
crossbar.realm = null;
crossbar.callback = null;
crossbar.afterDisconnect = null;

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
        if (!crossbar.checkAfterDisconnect()) {
            console.log("Disconnected from Router.");
            console.log(details);
            crossbar.connected = false;
            callback(crossbar.connected);
        }
    };

    crossbar.connection.open();
};

crossbar.disconnect = function() {
    if (!crossbar.connection) {
        crossbar.checkAfterDisconnect();
        return;
    }

    crossbar.connection.close();
    crossbar.connection = null;
    crossbar.session = null;
    crossbar.connected = false;
};

crossbar.checkAfterDisconnect = function() {
    if (crossbar.afterDisconnect) {
        crossbar.afterDisconnect();
        crossbar.afterDisconnect = null;
        return true;
    }
    return false;
}

// Periodic timer to check for change in config
setInterval(function() {
    // Open the config file
    fs.readFile('./config.json', 'utf8', function (err, data) {
        if (err) throw err;
        var config = JSON.parse(data);

        if (config.url == crossbar.url) {
            // Do Nothing
            return
        }
        else {
            console.log("Config: Change Detected");
            console.log(config);

            if (config.url != null) {
                crossbar.url = config.url;
                crossbar.realm = config.realm;
                crossbar.afterDisconnect = function() {
                    console.log("Config: Reconnecting");
                    crossbar.connect(crossbar.callback);
                }
            }
            else {
                crossbar.url = null;
                crossbar.realm = null;
            }

            crossbar.disconnect();
        }
    });

}, 1000);

module.exports = crossbar;