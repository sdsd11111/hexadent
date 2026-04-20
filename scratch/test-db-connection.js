const mysql = require('mysql2/promise');

const config = {
  host: 'mysql.us.stackcp.com',
  port: 43338,
  user: 'basededatosfinal-3530393448de',
  password: 'v381trwjwh',
  database: 'basededatosfinal-3530393448de',
};

async function test() {
  try {
    const connection = await mysql.createConnection(config);
    console.log('Successfully connected to mysql.us.stackcp.com:43338');
    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    console.log('Query result:', rows[0].result);
    await connection.end();
  } catch (error) {
    console.error('Failed to connect to mysql.us.stackcp.com:43338', error.message);
    
    // Try the second host
    console.log('Trying sdb-83.hosting.stackcp.net...');
    try {
      const config2 = { ...config, host: 'sdb-83.hosting.stackcp.net', port: 3306 }; // Default port if not specified
      const connection2 = await mysql.createConnection(config2);
      console.log('Successfully connected to sdb-83.hosting.stackcp.net');
      await connection2.end();
    } catch (error2) {
      console.error('Failed to connect to sdb-83.hosting.stackcp.net', error2.message);
    }
  }
}

test();
