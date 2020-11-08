/**
 * Redis client used for cache
 */

const logger = require("utils/logger");
const redis = require("redis");
const asyncRedis = require("async-redis");

const options = {
    port: appConfig.get("REDIS_PORT"),
    host: appConfig.get("REDIS_HOST"),
    password: appConfig.get("REDIS_AUTH"),
    
    retry_strategy: function(options) {
      // eslint-disable-line
      logger.debug("Inside retry strategy. Options :: ", options);
      if (options.times_connected > 120) {
        // End reconnecting with built in error
        logger.error("Exceeded retries ", options);
        return new Error("Retry count exceeded 120");
      }
      // reconnect after
      return 5000;
    }
  };
  
  const redisClient = redis.createClient(options);
  
  /**
   * Handles 'on' event when Redis DB gets connected
   */
  redisClient.on("connect", function() {
    logger.debug("Redis database got connected");
  });
  
  redisClient.on("error", function(err) {
    logger.error("Error in Redis database ", err);
  });
  
  redisClient.on("reconnecting", function(obj) {
    logger.debug("Redis Reconnected with delay ", obj);
  });
  
  redisClient.on("end", function() {
    logger.debug("Client has closed the connection");
  });
  
  redisClient.on("close", function() {
    logger.debug("client has closed the connection");
  });
  
  const asyncRedisClient = asyncRedis.decorate(client);

  module.exports.redisClient = asyncRedisClient;
  