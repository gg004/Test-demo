const ProjectMiddleware = require("../middleware/ProjectMiddleware");
const UrlMiddleware = require("../middleware/UrlMiddleware");
const HostMiddleware = require("../middleware/HostMiddleware");
const TokenMiddleware = require("../middleware/TokenMiddleware");
const { sqlDateFormat, sqlDateTimeFormat } = require("./UtilService");
const config = require("../config");
const Crypto = require('crypto');


const SECRET = config.license_secret
const ONE_DAY = 24 * 60 * 60 * 1000


function generateToken(){
    return Crypto.randomBytes(128).toString('hex');
}

function encryptToken(token, secret) {
    return Crypto.createHmac('sha256', secret).update(token).digest('hex');
}

/**
  * @param {Number} expiredIn
  *
  * @returns {Object}
  */
/**
  * @param {String} id
  */
/**
  * @param {String} id
  * @param {String} token
  *
  * @returns {Boolean}
  */

const LicensesStore =  {
    save: async (data,db) => {
        db.setProjectId(req.projectId);
        db.setTable("license_token");
        await db.insert({
            user_id:data.user_id,
            token:data.token
        })
        db.setTable("license_key");
        delete data.token
        const id = await db.insert({
            ...data,
            create_at: sqlDateFormat(new Date()),
            update_at: sqlDateTimeFormat(new Date())
        })
        return id;
    },
    bulkDelete: async (query,db,token)=>{
        const today = sqlDateTimeFormat(new Date());
        const query = `DELETE * FROM ${db.getProjectId()}_license WHERE ${query} AND key = '${encryptToken(token, SECRET)}' AND expire_at <= '${today}'`;
        await db.query(query);
    },
}

async function create(expiredIn,id) {
    const token = generateToken()
    const license = await LicensesStore.save({
    key : encryptToken(token, SECRET),
    token,
    user_id:id,
    expired: Date.now() + (expiredIn * ONE_DAY),
    })
    return {
        token,
        id: license
    }
}

async function remove(id,token) {
    await LicensesStore.bulkDelete(`objectId = '${id}'`,db,token)
}

async function verify(id,db) {
    
    db.setTable("license_token");
    const token = await db.get({
        user_id:req.user_id
    })

    if(!token || token.length === 0){
        throw new Error('No License Token.')
    }

    const query = `SELECT * FROM ${db.getProjectId()}_license WHERE objectId = '${id}' AND token = '${encryptToken(token, SECRET)}'`;
    const license = (await db.query(query))[0]
    if (!license) {
        throw new Error('License does\'t exist')
    }
    if (license.expired < Date.now()) {
        throw new Error('License is expired.')
    }
    return true
}

// Timer to delete expired licenses

async function execute(req){
    await LicensesStore.bulkDelete(`expired < ${Date.now()}`)
}

const  LicenseManager = {
    create : create(expiredIn),
    verify:verify(id,db),
    update:update(id,db),
    execute:execute(db),
    remove:remove(id,token),
}

module.exports = LicenseManager