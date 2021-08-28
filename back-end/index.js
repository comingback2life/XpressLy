//const DbConnection = require('./src/dbconnection.js').DbConnection;
//const User = require('./src/user.js').User;

import User from './src/user.js'
import Vendor from './src/vendor.js'
import Organization from './src/organization.js'
import DbConnection from './src/dbconnection.js';
import SendMoneyUseCase from './src/sendMoney.usecase.js';
import WithdrawMoneyUseCase from './src/withdrawMoney.usecase.js';
import VendorWithdrawUseCase from './src/vendorWithdraw.usecase.js';
import VendorTopupUseCase from './src/vendorTopup.usecase.js';
//const express = require('express');
import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import multer from 'multer';

const app = express();
const jsonParser = bodyParser.json()

const dbConnection = new DbConnection();
const con = dbConnection.connect();

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
	next();
})

const server = app.listen(8080, () => {
   const host = server.address().address
   const port = server.address().port
   console.log("Server started http://%s:%s", host, port)
	const connection = new DbConnection();
	connection.connect();


	app.post('/users', jsonParser, (req, res) => {
		const user = new User();
		console.log(req.body)
		user.username = req.body.username;
		user.password = req.body.password;
		user.fullName = req.body.fullname;
		user.email = req.body.email;
		const sql = `insert into user (username, password, email, fullName, status, availableBalance, holdBalance) values ('${user.username}', '${user.password}', '${user.email}', '${user.fullName}', 'ACTIVE', '0', '0')`;
		con.query(sql, (err, result) => {
			if (err) 
				res.status(400).json({
					message: 'Error creating user'
				})
			else
				res.status(200).json({
					'message': 'User created successfully' 
				})

		})
	})

	app.post('/vendors', jsonParser, (req, res) => {
		const vendor = new Vendor();
		vendor.username = req.body.username;
		vendor.password = req.body.password;
		vendor.vendorName = req.body.vendorName;
		vendor.email = req.body.email;
		const sql = `insert into vendor (username, password, email, vendorName, availableBalance, holdBalance) values ('${vendor.username}', '${vendor.password}', '${vendor.email}', '${vendor.vendorName}', '0', '0')`;
		con.query(sql, (err, result) => {
			if (err) 
				res.status(400).json({
					message: 'Error creating vendor'
				})
			else
				res.status(200).json({
					'message': 'Vendor created successfully' 
				})

		})
	})

	app.get('/organizations', jsonParser, (req, res) => {
		const sql = "select * from organization";
		con.query(sql, (err, result) => {
			res.status(200).json(result);
		})
	})

	app.get('/users', jsonParser, (req, res) => {
		const sql = "select * from user";
		con.query(sql, (err, result) => {
			res.status(200).json(result);
		})
	})


	app.get('/dashboard/:isWithdrawl', jsonParser, (req, res) => {
		let data = {};
			console.log('data', req.params)
		const sql = "select * from user";
		con.query(sql, (err, result) => {
			data.numberOfUsers = result.length;
			let query = `select * from transaction`;
			if (req.params && req.params.isWithdrawl==='true')
				query += ` where isWithdrawl=true`;

			con.query(query, (err, result) => {
				data.numberOfTransactions = result.length;
				data.numberOfWithdrawls = result.filter(r => r.isWithdrawl).length;
				data.numberOfDeposits = data.numberOfTransactions - data.numberOfWithdrawls;
				data.transactions = result;
				res.status(200).json(data);
			})
		})
	})


	app.post('/organizations', jsonParser, (req, res) => {
		const organization = new Organization();
		organization.name = req.body.name;
		organization.representativeFullName = req.body.representativeFullName;
		organization.username = req.body.username;
		organization.password = req.body.password;
		organization.phoneNumber = req.body.phoneNumber;
		organization.email = req.body.email;
		organization.purposeStatement = req.body.purposeStatement;
		organization.representativeContact = req.body.representativeContact;
		const sql = `insert into organization (name, password, purposeStatement, representativeFullName, availableBalance, holdBalance, username, phoneNumber, email) values ('${organization.name}', '${organization.password}', '${organization.purposeStatement}', '${organization.representativeFullName}', '0', '0', '${organization.username}', '${organization.phoneNumber}', '${organization.email}')`;
		con.query(sql, (err, result) => {
			if (err) {
				console.log(err)
				res.status(400).json({
					message: 'Error creating organization'
				})
			} else
				res.status(200).json({
					'message': 'Organization created successfully' 
				})
		})
	})

	const storage = multer.diskStorage({
			dest: (req, file, cb) => {
				cb(null, './vendors/slips');
			}
		})

	const upload = multer({dest: './vendors/slips/'})

	app.post('/vendors/topup', upload.single('file'), (req, res) => {
		const amount = req.body.amount;
		const username = req.body.username;
		new VendorTopupUseCase().initiate(username, amount);

		con.query(`insert into transaction (receiver, initiator, amount, isWithdrawl, type, transactionDate, status) values ('admin', '${username}', '${amount}', false, 'Vendor', '${new Date().toString()}', 'PENDING')`, (err, result) => {
		if (err) {
			console.log(err)
			res.status(400).json({
				message: 'Error occured when topup'
			})
		} else {
			res.status(200).json({
				message: 'Topup request sent to admin'
			})
		}
		})
	})


	app.post('/approve', jsonParser, (req, res) => {
		const sql = `update transaction set status='APPROVED' where id=${req.body.transactionId}`;
		con.query(sql, (err, result) => {
			if (err) {
				console.log(err)
				res.status(400).json({
					message: 'Error approving transaction'
				})
			} else
				con.query(`select * from transaction where id=${req.body.transactionId}`, (err, result) => {
					const username = result[0].initiator;
					const isWithdrawl = result[0].isWithdrawl;
					let amount = result[0].amount;

					let type = 'user';

					if (result[0].type === 'Vendor') 
						type = 'vendor';
					else if (result[0].type === 'Organization')
						type = 'organization';

					con.query(`select * from ${type} where username='${username}'`, (err, result) => {
						if (isWithdrawl) {
							amount = Number(result[0].availableBalance) - Number(amount);
						} else {
							amount = Number(result[0].availableBalance) + Number(amount);
						}

						con.query(`update ${type} set availableBalance='${amount}' where username='${username}'`, (err, result) => {

							res.status(200).json({
								'message': 'Transaction approved' 
							})
						})
					})
				
				})
		})
	})


	app.post('/reject', jsonParser, (req, res) => {
		const sql = `update transaction set status='REJECTED' where id=${req.body.transactionId}`;
		con.query(sql, (err, result) => {
			if (err) {
				console.log(err)
				res.status(400).json({
					message: 'Error rejecting transaction'
				})
			} else
				res.status(200).json({
					'message': 'Transaction rejected' 
				})
		})
	})



	app.post('/activateUser', jsonParser, (req, res) => {
		const sql = `update user set status='ACTIVE' where username='${req.body.username}'`;
		con.query(sql, (err, result) => {
			if (err) {
				console.log(err)
				res.status(400).json({
					message: 'Error activating user'
				})
			} else
				res.status(200).json({
					'message': 'User activated' 
				})
		})
	})


	app.post('/deactivateUser', jsonParser, (req, res) => {
		const sql = `update user set status='INACTIVE' where username='${req.body.username}'`;
		con.query(sql, (err, result) => {
			if (err) {
				console.log(err)
				res.status(400).json({
					message: 'Error deactivating user'
				})
			} else
				res.status(200).json({
					'message': 'User deactivated' 
				})
		})
	})


	app.get('/vendors', (req, res) => {
		const sql = `select username from vendor`;
		con.query(sql, (err, result) => {
			if (err) 
				res.status(400).json({
					message: 'Error loading vendors'
				})
			else
				res.status(200).json({
					result 
				})

		})
	})


	app.get('/transactions/:receiver', jsonParser, (req, res) => {
		const receiver = req.params.receiver;
		const sql = `select * from transaction where receiver='${receiver}'`;
		con.query(sql, (err, result) => {
			if (err) {
				console.log(err);
				res.status(400).json({
					message: 'Error loading transactions'
				})
			} else
				res.status(200).json({
					result 
				})
		})
	})


	app.get('/withdrawls', jsonParser, (req, res) => {
		const receiver = req.body.receiver;
		const sql = `select * from transaction where receiver='${receiver}' and isWithdrawl=true`;
		con.query(sql, (err, result) => {
			if (err) {
				console.log(err);
				res.status(400).json({
					message: 'Error loading transactions'
				})
			} else
				res.status(200).json({
					result 
				})
		})
	})


	app.post('/login', jsonParser, (req, res) => {
		//const token = connection.selectUser(req.body.username, req.body.password);
		let userType = req.body.isVendor ? 'vendor': 'user';

		if (req.body.isOrganization)
			userType = 'organization';

		if (req.body.username === 'admin') 
			userType = 'admin';

		const sql = `select * from ${userType} where username='${req.body.username}' and password='${req.body.password}'`;
		let fullName, availableBalance, holdBalance

		con.query(sql, (err, result) => {
			if (err || result.length === 0) {
				res.status(400).json({
					message: 'Invalid login'
				})
			} else {
				const token = jwt.sign({ username: req.body.username }, 'secret', { expiresIn: "2h", });
				if (userType === 'vendor')
					fullName = result[0].vendorName;
				if (userType === 'organization')
					fullName = result[0].name
				else
					fullName = result[0].fullName;

				availableBalance = result[0].availableBalance;
				holdBalance = result[0].holdBalance;

				res.status(200).json({token, fullName, availableBalance, holdBalance});
			}
		})
	})

	app.post('/users/send', jsonParser, (req, res) => {
		const senderUsername = req.body.sender;
		const receiverUsername = req.body.receiver;
		const amount = Number(req.body.amount);

		const sendMoneyUseCase = new SendMoneyUseCase();
		let sender, receiver;
		
		con.query(`select * from user where username='${senderUsername}'`, (err, result) => {
			if (err || result.length === 0) {
				res.status(400).json({message: 'Sender does not exist'});
				return;
			} else {
				sender = result[0];
				con.query(`select * from user where username='${receiverUsername}'`, (err, result) => {
					if (err || result.length === 0) {
						res.status(400).json({message: 'Receiver does not exist'});
						return;
					} else {
						receiver = result[0];
						try {
							sendMoneyUseCase.execute(sender, receiver, amount);
							con.query(`update user set availableBalance=${sender.availableBalance} where username='${senderUsername}'`, (err, result) => {
								if (err) {
									console.log(err)
									throw new Error({message: 'Error updating sender'});
								} else {
									con.query(`update user set availableBalance=${receiver.availableBalance} where username='${receiverUsername}'`, (err, result) => {
										con.query(`insert into transaction (receiver, initiator, amount, isWithdrawl, type, transactionDate, status) values ('${receiverUsername}', '${senderUsername}', '${amount}', false, 'Individual', '${new Date().toString()}', 'PENDING')`, (err, result) => {
											console.log('Transactions updated');
										})

										if (err) {
											throw new Error({message: 'Error updating receiver'});
										} else {
											res.status(200).json({message: 'Money successfully sent', availableBalance: sender.availableBalance});
										}
									});
								}
							})
						} catch (e) {
							console.log(e.message);
							res.status(400).header('Content-Type', 'application/json').json({message: e.message});
							return;
						}
					}
				})
			}
		})	
	})

	app.post('/users/topup', jsonParser, (req, res) => {
		const senderUsername = req.body.sender;
		const receiverUsername = req.body.receiver;
		const amount = Number(req.body.amount);

		const sendMoneyUseCase = new SendMoneyUseCase();
		let sender, receiver;
		
		con.query(`select * from vendor where username='${senderUsername}'`, (err, result) => {
			if (err || result.length === 0) {
				res.status(400).json({message: 'Sender does not exist'});
				return;
			} else {
				sender = result[0];
				con.query(`select * from user where username='${receiverUsername}'`, (err, result) => {
					if (err || result.length === 0) {
						res.status(400).json({message: 'Receiver does not exist'});
						return;
					} else {
						receiver = result[0];
						try {
							sendMoneyUseCase.execute(sender, receiver, amount);
							con.query(`update vendor set availableBalance=${sender.availableBalance} where username='${senderUsername}'`, (err, result) => {
								if (err) {
									console.log(err)
									throw new Error({message: 'Error updating vendor'});
								} else {
									con.query(`update user set availableBalance=${receiver.availableBalance} where username='${receiverUsername}'`, (err, result) => {
										if (err) {
											throw new Error({message: 'Error updating receiver'});
										} else {
											res.status(200).json({message: 'Money successfully sent', availableBalance: sender.availableBalance});
										}
									});
								}
							})
						} catch (e) {
							res.status(400).json({message: e.message});
						}
					}
				})
			}
		})	
	})


	app.post('/users/send/org/', jsonParser, (req, res) => {
		const senderUsername = req.body.sender;
		const organizationId = req.body.receiver;
		const amount = Number(req.body.amount);

		console.log(organizationId)
		const sendMoneyUseCase = new SendMoneyUseCase();
		let sender, receiver;
		con.query(`select * from user where username='${senderUsername}'`, (err, result) => {
			if (err || result.length === 0) {
				res.status(400).json({message: 'Sender does not exist'});
				return;
			} else {
				sender = result[0];
				con.query(`select * from organization where username='${organizationId}'`, (err, result) => {
					if (err || result.length === 0) {
						res.status(400).json({message: 'Receiver does not exist'});
						return;
					} else {
						receiver = result[0];
						try {
							sendMoneyUseCase.execute(sender, receiver, amount);
							con.query(`update user set availableBalance=${sender.availableBalance} where username='${senderUsername}'`, (err, result) => {
								if (err) {
									console.log(err)
									throw new Error({message: 'Error updating sender'});
								} else {
									console.log(receiver.availableBalance);
									con.query(`update organization set availableBalance='${receiver.availableBalance}' where username='${organizationId}'`, (err, result) => {
										if (err) {
											console.log(err);
											throw new Error({message: 'Error donating to organization'});
										} else {
											res.status(200).json({message: 'Money successfully sent', availableBalance: sender.availableBalance});
										}
									});
								}
							})
						} catch (e) {
							res.status(400).json({message: e.message});
						}
					}
				})
			}
		})
	})


	app.post('/users/withdraw', jsonParser, (req, res) => {
		const username = req.body.user;
		const vendorUsername = req.body.vendor;
		const amount = Number(req.body.amount);

		const withdrawMoneyUseCase = new WithdrawMoneyUseCase();
		let user, vendor;
		
		con.query(`select * from user where username='${username}'`, (err, result) => {
			if (err || result.length === 0) {
				res.status(400).json({message: 'User does not exist'});
				return;
			} else {
				user = result[0];
				user.holdBalance = Number(user.holdBalance);
				con.query(`select * from vendor where username='${vendorUsername}'`, (err, result) => {
					if (err || result.length === 0) {
						res.status(400).json({message: 'Vendor does not exist'});
						return;
					} else {
						vendor = result[0];

						if (!vendor.transactions) {
							vendor.transactions = [];
						}
						try {
							withdrawMoneyUseCase.execute(user, vendor, amount);
							con.query(`update user set holdBalance=${user.holdBalance}, code=${user.code} where username='${username}'`, (err, result) => {
								if (err) {
									console.log(err)
									throw new Error({message: 'Error updating hold balance'});
								} else {
									con.query(`insert into transaction (receiver, initiator, amount, isWithdrawl, type, transactionDate, status) values ('${vendorUsername}', '${username}', '${amount}', true, 'Individual', '${new Date().toString()}', 'PENDING')`, (err, result) => {
										if (result)
											console.log('Transactions updated');
										else
											console.log(err)
							})

									res.status(200).json({message: 'Withdraw request sent to vendor.', holdBalance: user.holdBalance, code: user.code});
								}
							})
						} catch (e) {
							console.log(e)
							res.status(400).json({message: e.message});
						}
					}
				})
			}
		})	
	})


	app.post('/vendors/withdraw', jsonParser, (req, res) => {
		const vendorUsername = req.body.vendor;
		const bankName = req.body.bankName;
		const bsbNumber = req.body.bsbNumber;
		const accountNumber = req.body.accountNumber;
		const amount = Number(req.body.amount);

		const vendorWithdrawUseCase = new VendorWithdrawUseCase();
		let user, vendor;
		
		con.query(`select * from vendor where username='${vendorUsername}'`, (err, result) => {
			if (err || result.length === 0) {
				res.status(400).json({message: 'Vendor does not exist'});
				return;
			} else {
				vendor = result[0];

				if (!vendor.transactions) {
					vendor.transactions = [];
				}
				try {
					vendorWithdrawUseCase.execute(vendor, amount, bankName, accountNumber);
					con.query(`update vendor set holdBalance=${vendor.holdBalance} where username='${vendorUsername}'`, (err, result) => {
						if (err) {
							console.log(err)
							throw new Error({message: 'Error updating hold balance'});
						} else {

							con.query(`insert into transaction (receiver, initiator, amount, isWithdrawl, type, transactionDate, status) values ('admin', '${vendorUsername}', '${amount}', true, 'Vendor', '${new Date().toString()}', 'PENDING')`, (err, result) => {
								console.log('Transactions updated');
							})
							res.status(200).json({message: 'Withdraw request sent to admin.', holdBalance: vendor.holdBalance});
						}
					})
				} catch (e) {
					console.log(e)
					res.status(400).json({message: e.message});
				}
			}
		})
	})



	app.post('/organizations/withdraw', jsonParser, (req, res) => {
		const username = req.body.user;
		const bankName = req.body.bankName;
		const bsbNumber = req.body.bsbNumber;
		const accountNumber = req.body.accountNumber;
		const amount = Number(req.body.amount);

		const vendorWithdrawUseCase = new VendorWithdrawUseCase();
		let user, organization;
		
		con.query(`select * from organization where username='${username}'`, (err, result) => {
			if (err || result.length === 0) {
				res.status(400).json({message: 'Organization does not exist'});
				return;
			} else {
				organization = result[0];

				if (!organization.transactions) {
					organization.transactions = [];
				}
				try {
					vendorWithdrawUseCase.execute(organization, amount, bankName, accountNumber);
					con.query(`update organization set holdBalance=${organization.holdBalance} where username='${username}'`, (err, result) => {
						if (err) {
							console.log(err)
							throw new Error({message: 'Error updating hold balance'});
						} else {

							con.query(`insert into transaction (receiver, initiator, amount, isWithdrawl, type, transactionDate, status) values ('admin', '${username}', '${amount}', true, 'Vendor', '${new Date().toString()}', 'PENDING')`, (err, result) => {
								console.log('Transactions updated');
							})

							res.status(200).json({message: 'Withdraw request sent to admin.', holdBalance: organization.holdBalance});
						}
					})
				} catch (e) {
					console.log(e)
					res.status(400).json({message: e.message});
				}
			}
		})
	})

	app.post('/admin/generate', jsonParser, (req, res) => {
		const amount = req.body.amount;


		con.query(`select * from admin limit 1`, (err, result) => {
			if (err) {
				console.log(err)
			}
			const admin = result[0];

			admin.availableBalance = Number(admin.availableBalance) + Number(amount)

			con.query(`update admin set availableBalance=${admin.availableBalance} where username='admin'`, (err, result) => {
				if (err) {
					console.log(err)
					throw new Error({message: 'Error generating amount'});
				} else {
					res.status(200).json({message: 'Amount generated', availableBalance: admin.availableBalance});
				}
			})
		})
	})

})
