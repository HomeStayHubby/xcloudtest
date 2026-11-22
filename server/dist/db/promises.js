export function runAsync(db, sql, ...params) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
export function getAsync(db, sql, ...params) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(row);
            }
        });
    });
}
export function allAsync(db, sql, ...params) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}
export function execAsync(db, sql) {
    return new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
//# sourceMappingURL=promises.js.map