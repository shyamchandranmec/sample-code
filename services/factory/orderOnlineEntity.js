"use strict";

let joi = require("joi");

module.exports = app => {

    let logger = app.helpers.logger;
    let entityModel = app.models.entity;
    let BaseEntity = app.services.factory.baseEntity;

    class OrderOnlineEntity extends BaseEntity {

        constructor (entityModel, conf) {
            super(entityModel, conf);
            this.entityModel = entityModel;
        }

        changeState () {
            logger.info("[OrderOnlineEntity] changing state of entity of id ${this.entityModel._id}");

            if (this.details.shipmentId) {
                this.entityModel.services.shipmentId = this.details.shipmentId;
            }

            return entityModel.changeState(this.entityModel._id, this);
        }

        /**
         * Validate EntityMeta Schema (Joi Rule(s))
         *
         * @returns {Promise}
         */
        getEntityMetaValidationSchema () {
            return joi.object().keys({
                order_type: joi.string().valid("order_online").required(),
                cloud_site_id: joi.number().required(),
                location_id: joi.number().required(),
                id: joi.number().required(),
                order_id: joi.string().required(),
                order_time: joi.date().timestamp("unix").required(),
                is_preorder: joi.boolean().required(),
                preorder_time: joi.date().timestamp("unix").required(),
                preorder_reminder_entry: joi.boolean().required(),
                aggregator_name: joi.string().required(),
                cart: joi.object().required().keys({
                    taxes: joi.array().required().items(
                        joi.object().keys({
                            tax_label: joi.string().required(),
                            tax_value: joi.number().required(),
                            tax_amount: joi.number().required(),
                            tax_type: joi.string().valid("cash", "percentage")
                        })
                    ),
                    additional_amounts: joi.array().required().items(
                        joi.object().keys({
                            label: joi.string().required(),
                            amonut: joi.number()
                        })
                    ),
                    total_tax: joi.number(),
                    total: joi.number(),
                    sub_total: joi.number(),
                    payment_mode: joi.string().valid("cod", "online"),
                    discount: joi.number(),
                    discount_amount: joi.number(),
                    discount_type: joi.string().valid("cash", "percentage"),
                    coupon_code: joi.string(),
                    coupon_status: joi.boolean(),
                    items: joi.array().required().items(
                        joi.object().keys({
                            product_price_id: joi.number().positive().required(),
                            product_name: joi.string().required(),
                            quantity: joi.number().positive(),
                            product_price: joi.number(),
                            total: joi.number(),
                            product_price_location_id: joi.number().positive().required(),
                            product_location_container_price: joi.number(),
                            addons: joi.array().items(
                                joi.object().keys({
                                    addon_id: joi.number().positive().required(),
                                    addon_name: joi.string().required(),
                                    addon_price: joi.number(),
                                    addon_qty: joi.number().positive()
                                })
                            )
                        })
                    )
                }),
                customer_details: joi.object().required().keys({
                    name: joi.string().required(),
                    email: joi.string().email().allow(""),
                    mobile: joi.string().max(15),
                    address: joi.object().required().keys({
                        address: joi.string().required().allow(""),
                        landmark: joi.string().required().allow(""),
                        location_id: joi.number().positive().required(),
                        location_name: joi.string().required(),
                        city_id: joi.number(),
                        city: joi.string().required().allow("")
                    })
                }),
                config: joi.object().required()
            });
        }
    }

    return OrderOnlineEntity;
};