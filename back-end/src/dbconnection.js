// const { createConnection } = require('mysql');
import { createConnection } from 'mysql';

export default class DbConnection {
	con = '';

	connect() {
		this.con = createConnection({
		  host: "localhost",
		  user: "xpressly",
		  password: "xpressly",
		  database: "xpressly"
		});

		this.con.connect(function(err) {
		  if (err) throw err;
		  console.log("Connected!");
		});

		return this.con;
	}

	async signup(user) {
		const sql = `insert into user (username, password, email, full_name, status, available_balance, hold_balance) values ('${user.username}', '${user.password}', '${user.email}', '${user.fullName}', 'ACTIVE', '0', '0')`;
		return await this.con.query(sql, (err, result) => {
			if (err) throw new Error('error signing up' + err);
		})
	}

	selectUser(username, password) {
		const sql = `select * from user where username='${username}' and password='${password}'`;

		this.con.query(sql, (err, res) => {

			if (err) throw new Error('');

			const token = jwt.sign({ username }, 'secret', { expiresIn: "2h", });
			console.log(token)
			result(null, token);
			return;
		})
	} 
}
