database = {}

database.redis = { 
     port : '6379',
     ip   : process.env.REDIS_IP || ''
}

database.mongo = {
     port : '',
     ip   : ''
}
module.exports = database

