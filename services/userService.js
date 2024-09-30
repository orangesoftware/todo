const promisePool = require("../lib/connections");

async function getUserByEmail(email) {
    try {
        const [rows] = await promisePool.query(`
            SELECT *,date_add(updatedDate,interval expiration MINUTE) expiration 
            FROM user
            WHERE email = ?`
            , [email]);
        return rows[0]; // Returns the first user object if found, otherwise undefined
    } catch (err) {
        console.error('Error retrieving user by email:', err);
        throw new Error('Database query failed');
    }

}

async function updateOptCode(user) {
    let sql = `UPDATE user
                 SET optCode = ?, 
                    updatedDate = CURRENT_TIMESTAMP

                 WHERE email = ?`;
    try {
        const result = await promisePool.query(sql, [user.optCode, user.email]);    
        return result[0];
    }
    catch (err) {
        console.error('Error updating optCode:', err);
        throw new Error('Database query failed');
    }
}

async function createUser(user) {
    const result = await promisePool.query(`INSERT INTO user 
        (email, firstName, lastName, password, createdBy) 
        VALUES (?, ?, ?, ?, ?)`, 
        [
            user.email
            , user.name
            , user.lastName
            , user.hashedPassword
            , user.createdBy]
        );
    return result;
}


//Allow only 1 setting active per user

async function getSettingsById(settingId) {
    try {
        const [rows] = await promisePool.query('SELECT * FROM settings WHERE id = ?', [settingId]);
        return rows[0]; // Returns the first settings object if found, otherwise undefined
    } catch (err) {
        console.error('Error retrieving settings by id:', err);
        throw new Error('Database query failed');
    }
};

async function getSettingsByCreatedBy(createdBy) {
    try {
        const [rows] = await promisePool.query('SELECT * FROM settings WHERE createdBy = ?', [createdBy]);
        return rows[0]; // Returns the first settings object if found, otherwise undefined
    } catch (err) {
        console.error('Error retrieving settings by createdBy:', err);
        throw new Error('Database query failed');
    }
};

async function updateSettings(settings) {
    let sql = `
        UPDATE settings
        SET mobile = ?
        , twoFA = ?
        , byEmail = ?
        , enableNotifications = ?
        , remainderDays = ?
        WHERE id = ?
    `;
    try {
        const result = await promisePool.query(sql, 
        [
            settings.mobile
            , settings.twoFA
            , settings.byEmail
            , settings.enableNotifications
            , settings.remainderDays
            , settings.id]
        );
        return result[0];
    } catch (err) {
        console.error('Error updating settings:', err);
        throw new Error('Database query failed');
    }
};


async function createSettings(settings) {
    let sql = `
        INSERT INTO settings (
            mobile,
            twoFA,
            byEmail,
            enableNotifications,
            remainderDays,
            createdBy
            )
            Values (?, ?, ?, ?, ?, ?)
    `;
    try{
        const result = await promisePool.query(sql, 
        [
            settings.mobile
            , settings.twoFA
            , settings.byEmail
            , settings.enableNotifications
            , settings.remainderDays
            , settings.createdBy]
        );
    return result[0];
    }catch(err){
        console.error('Error creating settings:', err);
        throw new Error('Database query failed');
    }
}

module.exports = {
    getUserByEmail,
    createUser,
    createSettings,
    getSettingsByCreatedBy,
    getSettingsById,
    updateSettings,
    updateOptCode
};
