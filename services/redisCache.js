/**
 * Redis client used for cache
 */

const logger = require("utils/logger");
const redis = require("redis");

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
    logger.warn("Client has closed the connection");
  });
  
  redisClient.on("close", function() {
    logger.warn("client has closed the connection");
  });
  
  /***
   * This function is required as azure redis disconnects if the connection is not being used in less than 5 minutes
   */
  setInterval(function() {
    redisClient.ping();
  }, 60000); // 60 seconds
  
  const redisPing = function (callback) {
    let success = false;
    redisClient.set("testKey", "Redis", function (err, data) {
      success = true;
    });
    setTimeout(function(){
      // If within 1000 msec we dont get response from Redis, we will assume that redis is down.
      if (!success) {
        return callback(new Error('Redis timed out'));
      } else {
        return callback(null, "OK");
      }
      }, 1000);
  };
  
  module.exports = {
    redisSet: function(cacheKey, partitionId, callback) {
      async.retry(
        { times: RETRY_COUNT, interval: RETRY_INTERVAL },
        function(cb) {
          redisClient.set(cacheKey, partitionId, cb);
        }.bind(this),
        callback
      );
    },
  
    redisGet: function(cacheKey, callback) {
      async.retry(
        { times: RETRY_COUNT, interval: RETRY_INTERVAL },
        function(cb) {
          redisClient.get(cacheKey, cb);
        }.bind(this),
        callback
      );
    },
  
    redisDelete: function(cacheKey, callback) {
      async.retry(
        { times: RETRY_COUNT, interval: RETRY_INTERVAL },
        function(cb) {
          redisClient.del(cacheKey, cb);
        }.bind(this),
        callback
      );
    },
  
    redisBatchDelete : function (cacheKeys, callback) {
      let redisBatch = redisClient.batch();
  
      for(let i=0; i<cacheKeys.length;i++){
        redisBatch.del(cacheKeys[i])
      }
  
      async.retry(
        { times: RETRY_COUNT, interval: RETRY_INTERVAL },
        function(cb) {
          redisBatch.exec(cb);
        }.bind(this),
        callback
      );
    },
  
    redisBatchSet : function (keysValues, callback) {
      let redisBatch = redisClient.batch();
  
      for(let i=0; i<keysValues.length;i++){
        if(keysValues[i].key && keysValues[i].value) {
          redisBatch.set(keysValues[i].key, keysValues[i].value);
        }
      }
  
      async.retry(
        { times: RETRY_COUNT, interval: RETRY_INTERVAL },
        function(cb) {
          redisBatch.exec(cb);
        }.bind(this),
        callback
      );
    },
  
    redisPing: redisPing
  };
  