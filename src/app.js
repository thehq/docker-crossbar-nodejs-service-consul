var crossbar = require('./crossbar.js');

function test_example(args, kwargs) {
    return true;
}

function main(connected) {
    if (connected == true) {

        // Create a test session
        crossbar.connection.session.register("com.example.test", test_example).then(
            function (reg) {
                console.log("Registered for RPC 'com.example.test'");
            },
            function (err) {
                console.log("failed to register procedure: " + err);
            }
        );
    }
}

crossbar.connect(main);
