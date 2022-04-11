import mysql from 'mysql'

export default mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'srzd',
  port: 3306,
  multipleStatements: true,
})
