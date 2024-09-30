const promisePool = require("../lib/connections");

async function getTaskById(taskId) {
    try {
        let sql = `SELECT 
                        id,
                        title,
                        description,
                        DATE_FORMAT(dueDate, '%Y-%m-%d') dueDate,
                        DATE_FORMAT(CONVERT_TZ(dueDate, '+00:00', @@session.time_zone), '%Y-%m-%d') dueDate2,
                        priority,
                        status,
                        createdBy,
                        createdDate,
                        updatedBy,
                        updatedDate
                    FROM task 
                    WHERE id = ?`;
        const [rows] = await promisePool.query(sql, [taskId]);
        return rows[0]; // Returns the first user object if found, otherwise undefined
    } catch (err) {
        console.error('Error retrieving task by id:', err);
        throw new Error('Database query failed');
    }

}

async function getTaskByCreatedBy(createdBy) {
    try {
        let sql = `SELECT 
                        id,
                        title,
                        description,
                        DATE_FORMAT(dueDate, '%Y-%m-%d') dueDate,
                        DATE_FORMAT(CONVERT_TZ(dueDate, '+00:00', @@session.time_zone), '%Y-%m-%d') dueDate2,
                        priority,
                        status,
                        createdBy,
                        createdDate,
                        updatedBy,
                        updatedDate
                    FROM task 
                    WHERE createdBy = ?`;
        const [rows] = await promisePool.query(sql, [createdBy]);
        return rows; // Returns the first user object if found, otherwise undefined
    } catch (err) {
        console.error('Error retrieving task by id:', err);
        throw new Error('Database query failed');
    }

}


async function createTask(task) {
    const [result] = await promisePool.query(`INSERT INTO task 
        (title, description, dueDate, priority,status, createdBy) 
        VALUES (?, ?, ?, ?, ?)`, 
        [
            task.title
            , task.description
            , task.dueDate
            , task.priority
            , task.status
            , task.createdBy]
        );
    return result;
}

async function updateTask(task) {
    const [result] = await promisePool.query(`Update task 
        set title = ?, 
            description = ?, 
            dueDate = ?, 
            priority = ?,
            status = ?, 
            updatedBy = ?, 
            updatedDate = CURRENT_TIMESTAMP
        where id = ?`, 
        [
            task.title
            , task.description
            , task.dueDate
            , task.priority
            , task.status
            , task.createdBy
            , task.id]
        );
        
    return result;
}

module.exports = {
    getTaskById,
    getTaskByCreatedBy,
    createTask,
    updateTask
};