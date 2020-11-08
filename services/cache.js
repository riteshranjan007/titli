/**
 * A Wrapper over Redis cache.
 * This uses in-memory LRU Cache with backup as Redis Cache 
 * The in Memory cache is used for very fast resolution of urlCode to LongURL
 */
const { REDIS_ENABLED } = process.env;
const redisEnabled =  REDIS_ENABLED == 'True';

const LRU = require('lru-cache');
const {redisClient} = require('../services/redisCache');

const options = { 
            max: 500, 
            length: (n, key) => { return n * 2 + key.length },
            maxAge: 1000 * 60 * 60 
        };
            
class Cache {

    constructor() {
        this.memCache = new LRU(options)
        if(redisEnabled){
            this.redisClient = redisClient();
        }
    }
    
    /**
     * get the value from memory cache if not found try to get from redis
     *
     */
    async get(key){
        let val = this.memCache.get(key);
        if(!redisEnabled){
            return val;
        }
        
        // If not found in memory, try redis
        val = await this.redisClient.get(key);
        if(val){
            this.memCache.set(key, val);
        }
        return val; 
    }

     /**
     * Set the value in memory cache and redis cache
     */
    async set(key, val){
        
        this.memCache.set(key,val);   
        if(!redisEnabled){
            return;
        }
        //set in redis cache as well
        await this.redisClient.set(key, val);
    }
}

module.exports.Cache = Cache;