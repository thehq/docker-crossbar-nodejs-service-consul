var config = {};

config.XBAR_URL = process.env.ROUTER_URL;
config.XBAR_REALM = process.env.ROUTER_REALM;
config.XBAR_USER = process.env.ROUTER_USER;
config.XBAR_SECRET = process.env.ROUTER_SECRET;

module.exports = config;