"use strict";

module.exports = app => {

    let BaseClass = app.services.publisherFactory.baseClass;
    let errorFormatter = app.helpers.errorFormatter;
    let logger = app.helpers.logger;
    let tlObject = app.helpers.pubnub;

    const ENTITY_TYPE = "entityType";
    const ENTITY_TYPE_STATE = "entityTypeState";
    const ENTITY_TYPE_UPDATE = "entityTypeUpdate";
    const CLOUD_SITE = "cloudSite";
    const CLOUD_SITE_STATE = "cloudSiteState";
    const CLOUD_SITE_UPDATE = "cloudSiteUpdate";
    const LOCATION = "location";
    const LOCATION_STATE = "locationState";
    const LOCATION_UPDATE = "locationUpdate";

    class Pubnub extends BaseClass {
        constructor (entity) {
            super(entity);
            this.entity = entity;
            this.createChannels();
        }

        /**
         * update entity
         * @param entity
         */

        updateEntity (entity) {
            this.entity = entity;
        }

        /**
         * publish Data on entity creation
         * pushes to location & cloudSite channel
         * @param entity
         * @param isUpdate
         * @returns {Promise}
         */
        pushEntityOnCreate () {
            return new Promise((resolve, reject) => {
                this.publishToChannel(LOCATION)
                    .then(() => this.publishToChannel(CLOUD_SITE))
                    .then(() => this.publishToChannel(ENTITY_TYPE))
                    .then(() => resolve(this.entity))
                    .catch((error) => reject(error));
            });
        }

        /**
         * publish data on entity update
         * pushes to location, cloudSite & entityType channel
         * @param entity
         * @returns {Promise}
         */
        pushEntityOnUpdate () {
            return new Promise((resolve, reject) => {
                this.publishToChannel(LOCATION_UPDATE)
                    .then(() => this.publishToChannel(CLOUD_SITE_UPDATE))
                    .then(() => this.publishToChannel(ENTITY_TYPE_UPDATE))
                    .then(() => resolve(this.entity))
                    .catch((error) => reject(error));
            });
        }

        /**
         * publish data on entity update
         * pushes to location, cloudSite & entityType channel
         * @param entity
         * @returns {Promise}
         */
        pushEntityState () {
            return new Promise((resolve, reject) => {
                this.publishToChannel(LOCATION_STATE)
                    .then(() => this.publishToChannel(CLOUD_SITE_STATE))
                    .then(() => this.publishToChannel(ENTITY_TYPE_STATE))
                    .then(() => resolve(this.entity))
                    .catch((error) => resolve(error));
            });
        }

        /**
         * creates Channel names based on entity details
         * @param entity
         * @param isUpdate
         * @returns {Promise.<T>}
         */
        createChannels () {
            return new Promise((resolve, reject) => {
                if (!this.entity || !this.entity.entityType || !this.entity.cloudSiteId || !this.entity.locationId) {
                    logger.error("[Pubnub] [createChannels] Can't create channel list");
                    logger.error(this.entity);

                    let errorObject = errorFormatter.createErrorObject({
                        status: 404,
                        message: "Can't create channel List",
                        details: "Invalid entity data"
                    });

                    return reject(errorObject);
                } else {
                    let stateChannelSuffix = "-state";
                    let updateChannelSuffix = "-update";
                    logger.info(`[Pubnub] [createChannels] Creating Channel List - entity ${this.entity.id}`);
                    this.channels = new Map();
                    /**
                     * lt-oo
                     * All entitytype related changes for new entities are pushed here.
                     */
                    this.channels.set(ENTITY_TYPE, `lt-${this.entity.entityType}`);
                    this.channels.set(CLOUD_SITE, `lt-${this.entity.entityType}-${this.entity.cloudSiteId}`);
                    this.channels.set(LOCATION, `lt-${this.entity.entityType}-${this.entity.cloudSiteId}-${this.entity.locationId}`);
                    this.channels.set(ENTITY_TYPE_STATE, `lt-${this.entity.entityType}${stateChannelSuffix}`);
                    this.channels.set(CLOUD_SITE_STATE, `lt-${this.entity.entityType}-${this.entity.cloudSiteId}${stateChannelSuffix}`);
                    this.channels.set(LOCATION_STATE, `lt-${this.entity.entityType}-${this.entity.cloudSiteId}-${this.entity.locationId}${stateChannelSuffix}`);
                    this.channels.set(ENTITY_TYPE_UPDATE, `lt-${this.entity.entityType}${updateChannelSuffix}`);
                    this.channels.set(CLOUD_SITE_UPDATE, `lt-${this.entity.entityType}-${this.entity.cloudSiteId}${updateChannelSuffix}`);
                    this.channels.set(LOCATION_UPDATE, `lt-${this.entity.entityType}-${this.entity.cloudSiteId}-${this.entity.locationId}${updateChannelSuffix}`);
                    return resolve();
                }
            });
        }

        /**
         * publish entity to specified type channel
         *
         * @param channelType
         * @returns {Promise}
         */
        publishToChannel (channelType) {
            return new Promise((resolve, reject) => {
                let channel = this.channels.get(channelType);

                if (channel === undefined) {
                    logger.error("[Pubnub] [publishToEntityType] Unable to find channel -", channelType);

                    let errorObject = errorFormatter.createErrorObject({
                        status: 400,
                        message: "Unable to get channelList",
                        details: `Can't find ${channelType} channel in channel map`
                    });

                    return reject(errorObject);
                } else {
                    this.publish(this.entity, channel);
                    logger.info(`[Pubnub] [publishToEntityType] Published - channel, entityId - ${channel}, ${this.entity._id}`);

                    return resolve();
                }
            });
        }

        /**
         * Publish the data to given channel
         *
         * @param data
         * @param channel
         */
        publish (data, channel) {
            let self = this;
            tlObject.publish({
                channel: channel,
                message: data,
                callback: function (e) {
                    logger.info(`Successful publish to channel : ${channel} : ${e}`);
                },
                error: function (e) {
                    logger.info(`Error Occurred while publishing  ${JSON.stringify(e)} -- Retrying in 3 seconds`);
                    // TODO: handle retry & notif in case of failure
                    self.publish(data, channel);
                }
            });
        }
    }
    return Pubnub;
};