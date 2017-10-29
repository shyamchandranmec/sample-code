"use strict";

let Punbub = require("pubnub");

module.exports = app => {

    let config = app.config.envVariables;

    let publisher = new Punbub({
        ssl: true,
        publish_key: config.pubnub_publishKey,
        subscribe_key: config.pubnub_subscribeKey
    });

    return publisher;
};