//const DbConnection = require('./src/dbconnection.js').DbConnection;
//const User = require('./src/user.js').User;

import User from './src/user.js'
import Vendor from './src/vendor.js'
import Organization from './src/organization.js'
import DbConnection from './src/dbconnection.js';
import SendMoneyUseCase from './src/sendMoney.usecase.js'; import WithdrawMoneyUseCase from './src/withdrawMoney.usecase.js';
import VendorWithdrawUseCase from './src/vendorWithdraw.usecase.js';
import VendorTopupUseCase from './src/vendorTopup.usecase.js';
//const express = require('express');
import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { promisify } from 'util';
const readFileAsync = promisify(fs.readFile)


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

	const userStorage = multer.diskStorage({
			dest: (req, file, cb) => {
				cb(null, './users/');
			}
		})

	const userImageUpload = multer({dest: './users/'})



	app.post('/users', userImageUpload.single('file'), (req, res) => {
		const user = new User();
		user.username = req.body.username;
		user.password = req.body.password;
		user.fullName = req.body.fullname;
		user.email = req.body.email;
		user.image = req.file.filename;
		const sql = `insert into user (username, password, email, fullName, status, availableBalance, holdBalance, image) values ('${user.username}', '${user.password}', '${user.email}', '${user.fullName}', 'ACTIVE', '0', '0', '${user.image}')`;
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

	app.post('/users/profilePicture', userImageUpload.single('file'), (req, res) => {
		const user = new User();
		user.username = req.body.username;
		user.image = req.file.filename;
		const sql = `update user set image='${user.image}' where username='${user.username}'`;
		con.query(sql, (err, result) => {
			if (err) 
				res.status(400).json({
					message: 'Error updating profile picture'
				})
			else {
				fs.readFile(`./users/${user.image}`, `base64`, 
					(err, base64Image) => { 
						const dataUrl = `data:image/jpeg;base64, ${base64Image}` 
						return res.send(dataUrl); 
					} 
				);

			}
		})
	})


	const vendorStorage = multer.diskStorage({
			dest: (req, file, cb) => {
				cb(null, './vendor/');
			}
		})

	const vendorImageUpload = multer({dest: './vendor/'})



	app.post('/vendors', vendorImageUpload.single('file'), (req, res) => {
		const vendor = new Vendor();
		vendor.username = req.body.username;
		vendor.password = req.body.password;
		vendor.vendorName = req.body.vendorName;
		vendor.email = req.body.email;
		vendor.image = req.file.filename;

		const sql = `insert into vendor (username, password, email, vendorName, availableBalance, holdBalance, image) values ('${vendor.username}', '${vendor.password}', '${vendor.email}', '${vendor.vendorName}', '0', '0', '${vendor.image}')`;
		con.query(sql, (err, result) => {
			if (err) {
				console.log(err);
				res.status(400).json({
					message: 'Error creating vendor'
				})
			} else
				res.status(200).json({
					'message': 'Vendor created successfully' 
				})

		})
	})


	app.post('/vendors/profilePicture', vendorImageUpload.single('file'), (req, res) => {
		const user = new User();
		user.username = req.body.username;
		user.image = req.file.filename;
		const sql = `update vendor set image='${user.image}' where username='${user.username}'`;
		con.query(sql, (err, result) => {
			if (err) 
				res.status(400).json({
					message: 'Error updating profile picture'
				})
			else {
				fs.readFile(`./vendor/${user.image}`, `base64`, 
					(err, base64Image) => { 
						const dataUrl = `data:image/jpeg;base64, ${base64Image}` 
						return res.send(dataUrl); 
					} 
				);

			}
		})
	})




	app.get('/organizations', jsonParser, (req, res) => {
		const sql = "select * from organization";
		con.query(sql, (err, result) => {
			const response = result;
			getOrgImages(response);
			res.status(200).send(response);
		})
	})

	function getOrgImages(response) {
			for(const resp of response) {
				if (resp.image) {
					readFileAsync(`./orgs/${resp.image}`, `base64`, 
					(err, base64Image) => { 
						const dataUrl = `data:image/jpeg;base64, ${base64Image}` 
						resp.image = dataUrl; 
					})
				}
			}

	}

	app.get('/users/profilePicture/:username', jsonParser, (req, res) => {
		const username = req.params.username
		const sql = `select image from user where username='${username}'`;
		con.query(sql, (err, result) => {
			if (err) {
				console.log(err);
			}

			console.log(result[0].image);
			//res.status(200).sendFile(`users/${result[0].image}`, { root: '.' });
			fs.readFile(`./users/${result[0].image}`, `base64`, 
				(err, base64Image) => { 
					const dataUrl = `data:image/jpeg;base64, ${base64Image}` 
					return res.send(dataUrl); 
				} 
			);
		})
	})


	app.get('/depositSlips/:transactionId', jsonParser, (req, res) => {
		console.log('here');
		const transactionId = req.params.transactionId;
		const sql = `select image from transaction where id='${transactionId}'`;
		con.query(sql, (err, result) => {
			if (err) {
				console.log(err);
			}

			if (result && result.length) {
				console.log(result[0].image);
				//res.status(200).sendFile(`users/${result[0].image}`, { root: '.' });
				fs.readFile(`./vendors/slips/${result[0].image}`, `base64`, 
					(err, base64Image) => { 
						const dataUrl = `data:image/jpeg;base64, ${base64Image}` 
						return res.send(dataUrl); 
					} 
				);
			}
		})
	})



	app.get('/users/:username', jsonParser, (req, res) => {
		const username = req.params.username
		const sql = `select * from user where username='${username}'`;
		con.query(sql, (err, result) => {
			res.status(200).json(result[0]);
		})
	});


	app.get('/vendors/:username', jsonParser, (req, res) => {
		const username = req.params.username
		const sql = `select * from vendor where username='${username}'`;
		con.query(sql, (err, result) => {

			if (err)
				console.log(err);
			res.status(200).json(result[0]);
		})
	});



	app.get('/organizations/:username', jsonParser, (req, res) => {
		const username = req.params.username
		const sql = `select * from organization where username='${username}'`;
		con.query(sql, (err, result) => {
			res.status(200).json(result[0]);
		})
	});

	app.get('/organizations/profilePicture/:username', jsonParser, (req, res) => {
		const username = req.params.username
		const sql = `select image from organization where username='${username}'`;
		con.query(sql, (err, result) => {
			if (err) {
				console.log(err);
			}

			console.log(result[0].image);
			//res.status(200).sendFile(`users/${result[0].image}`, { root: '.' });
			fs.readFile(`./orgs/${result[0].image}`, `base64`, 
				(err, base64Image) => { 
					const dataUrl = `data:image/jpeg;base64, ${base64Image}` 
					return res.send(dataUrl); 
				} 
			);
		})
	})



	app.get('/vendors/profilePicture/:username', jsonParser, (req, res) => {
		const username = req.params.username
		const sql = `select image from vendor where username='${username}'`;
		con.query(sql, (err, result) => {
			if (err) {
				console.log(err);
			}

			console.log(result[0].image);
			//res.status(200).sendFile(`users/${result[0].image}`, { root: '.' });
			fs.readFile(`./vendor/${result[0].image}`, `base64`, 
				(err, base64Image) => { 
					const dataUrl = `data:image/jpeg;base64, ${base64Image}` 
					return res.send(dataUrl); 
				} 
			);
		})
	})




	app.get('/users', jsonParser, (req, res) => {
		let users = [];
		const sql = "select * from user";
		con.query(sql, (err, result) => {
			users = users.concat(result);
			users.forEach(user => {
				user.type = 'Individual';
			})
			con.query("select * from vendor", (err, result) => {
				users = users.concat(result);

				users.forEach(user => {
					if (!user.type)
						user.type = 'Vendor';
				})
				con.query("select * from organization", (err, result) => {
					users = users.concat(result);

					users.forEach(user => {
						if (!user.type)
							user.type = 'Organization';
					})

					res.status(200).json(users);
				})
			})
		})
	})


	app.get('/dashboard/:isWithdrawl', jsonParser, (req, res) => {
		let data = {};
			console.log('data', req.params.isWithdrawl)
		const sql = "select * from user";
		con.query(sql, (err, result) => {
			data.numberOfUsers = result.length;
			let query = `select * from transaction where receiver='admin'`;
			if (req.params && req.params.isWithdrawl==='true')
				query += ` and isWithdrawl=true`;

			console.log(query)
			data.numberOfTransactions = 0;
			data.numberOfWithdrawls = 0;
			data.numberOfDeposits = 0;
			data.transactions = [];
			con.query(query, (err, result) => {
				if (err) {
					console.log(err);
				}
				if (result) {
					data.numberOfTransactions = result.length;
					data.numberOfWithdrawls = result.filter(r => r.isWithdrawl).length;
					data.numberOfDeposits = data.numberOfTransactions - data.numberOfWithdrawls;
					data.transactions = result;
				}
				res.status(200).json(data);
			})
		})
	})

	const orgStorage = multer.diskStorage({
			dest: (req, file, cb) => {
				cb(null, './orgs/');
			}
		})

	const orgImageUpload = multer({dest: './orgs/'})



	app.post('/organizations', orgImageUpload.single('file'), (req, res) => {
		const organization = new Organization();
		organization.name = req.body.name;
		organization.representativeFullName = req.body.representativeFullName;
		organization.purposeStatement = req.body.purposeStatement;
		organization.username = req.body.username;
		organization.password = req.body.password;
		organization.phoneNumber = req.body.phoneNumber;
		organization.email = req.body.email;
		organization.purposeStatement = req.body.purposeStatement;
		organization.representativeContact = req.body.representativeContact;
		organization.image = req.file.filename;
		const sql = `insert into organization (name, password, purposeStatement, representativeFullName, availableBalance, holdBalance, username, phoneNumber, email, image) values ('${organization.name}', '${organization.password}', '${organization.purposeStatement}', '${organization.representativeFullName}', '0', '0', '${organization.username}', '${organization.phoneNumber}', '${organization.email}', '${organization.image}')`;
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


	app.post('/organizations/profilePicture', orgImageUpload.single('file'), (req, res) => {
		const user = new User();
		user.username = req.body.username;
		user.image = req.file.filename;
		const sql = `update organization set image='${user.image}' where username='${user.username}'`;
		con.query(sql, (err, result) => {
			if (err) 
				res.status(400).json({
					message: 'Error updating profile picture'
				})
			else {
				fs.readFile(`./orgs/${user.image}`, `base64`, 
					(err, base64Image) => { 
						const dataUrl = `data:image/jpeg;base64, ${base64Image}` 
						return res.send(dataUrl); 
					} 
				);

			}
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
		const filename = req.file.filename;
		new VendorTopupUseCase().initiate(username, amount);

		con.query(`insert into transaction (receiver, initiator, amount, isWithdrawl, type, transactionDate, status, image) values ('admin', '${username}', '${amount}', false, 'Vendor', '${new Date().toString()}', 'PENDING', '${filename}')`, (err, result) => {
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

	app.post('/forgotPassword', jsonParser, (req, res) => {
		const userType = req.body.userType;

		let table = 'user';
		if (userType === 'vendor') {
			table = 'vendor';
		} else if (userType === 'organization') {
			table = 'organization';
		}

		const newPassword = (Math.random() + 1).toString(36).substring(7);
		const sql = `update ${table} set password='${newPassword}' where email='${req.body.email}'`;
		con.query(sql, (err, result) => {
			if (err) {
				console.log(err)
				res.status(400).json({
					message: 'Error reseting password'
				})
			} else {
				let transporter = nodemailer.createTransport({
				  service: 'hotmail',
				  auth: {
					user: 'xpresslyweb@outlook.com',
					pass: 'Samip@123'
				  }
				});

				let mailOptions = {
				  from: 'xpresslyweb@outlook.com',
				  to: req.body.email,
				  subject: 'Reset Password',
				  text: 'Your password is: ' + newPassword
				};

				transporter.sendMail(mailOptions, function(error, info){
				  if (error) {
					console.log(error);
				  } else {
					console.log('Email sent: ' + info.response);
					res.status(200).json({
						'message': 'Please check your email for new password' 
					})
				  }
				});
			}
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


	app.get('/transactions/:receiver/', jsonParser, (req, res) => {
		const receiver = req.params.receiver;
		const sql = `select * from transaction where receiver='${receiver}' or initiator='${receiver}'`;
		con.query(sql, (err, result) => {
			if (err) {
				console.log(err);
				res.status(400).json({
					message: 'Error loading transactions'
				})
			} else {
				const transactions = result;
				getDepositSlips(transactions)
				res.status(200).send({
					transactions 
				})
			}
		})
	})


	function getDepositSlips(response) {
			for(const resp of response) {
				if (resp.image) {
					readFileAsync(`./vendors/slips/${resp.image}`, `base64`, 
					(err, base64Image) => { 
						const dataUrl = `data:image/jpeg;base64, ${base64Image}` 
						resp.image = dataUrl; 
					})
				}
			}

	}


	app.get('/withdrawls', jsonParser, (req, res) => {
		const receiver = req.body.receiver;
		console.log(receiver);
		const sql = `select * from transaction where receiver='${receiver}' and isWithdrawl=true`;
		con.query(sql, (err, result) => {
			if (err) {
				console.log(err);
				res.status(400).json({
					message: 'Error loading transactions'
				})
			} else {
				console.log(result);
				res.status(200).json({
					result 
				})
			}
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




	app.post('/vendors/send', jsonParser, (req, res) => {
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
									throw new Error({message: 'Error updating sender'});
								} else {
									con.query(`update user set availableBalance=${receiver.availableBalance} where username='${receiverUsername}'`, (err, result) => {
										con.query(`insert into transaction (receiver, initiator, amount, isWithdrawl, type, transactionDate, status) values ('${receiverUsername}', '${senderUsername}', '${amount}', false, 'Individual', '${new Date().toString()}', 'APPROVED')`, (err, result) => {
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







	app.post('/users/send', jsonParser, (req, res) => {
		const senderUsername = req.body.sender;
		const receiverUsername = req.body.receiver;
		console.log(senderUsername, '   ', receiverUsername);
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
										con.query(`insert into transaction (receiver, initiator, amount, isWithdrawl, type, transactionDate, status) values ('${receiverUsername}', '${senderUsername}', '${amount}', false, 'Individual', '${new Date().toString()}', 'APPROVED')`, (err, result) => {
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

		console.log(req.body.receiver);
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
											con.query(`insert into transaction (receiver, initiator, amount, isWithdrawl, type, transactionDate, status) values ('${receiver.username}', '${senderUsername}', '${amount}', false, 'Individual', '${new Date().toString()}', 'APPROVED')`, (err, result) => {
											res.status(200).json({message: 'Money successfully sent', availableBalance: sender.availableBalance});
											});
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


	app.post('/users/topupRequest', jsonParser, (req, res) => {
		const username = req.body.user;
		const vendorUsername = req.body.vendor;
		const amount = Number(req.body.amount);

		let user, vendor;
		
		con.query(`select * from user where username='${username}'`, (err, result) => {
			if (err || result.length === 0) {
				res.status(400).json({message: 'User does not exist'});
				return;
			} else {
				user = result[0];
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
							con.query(`update user set holdBalance=${user.holdBalance}, code=${user.code} where username='${username}'`, (err, result) => {
								if (err) {
									console.log(err)
									throw new Error({message: 'Error updating hold balance'});
								} else {
									con.query(`insert into transaction (receiver, initiator, amount, isWithdrawl, type, transactionDate, status) values ('${vendorUsername}', '${username}', '${amount}', false, 'Individual', '${new Date().toString()}', 'PENDING')`, (err, result) => {
										if (result)
											console.log('Transactions updated');
										else
											console.log(err)
							})

									res.status(200).json({message: 'Topup request sent to vendor.', holdBalance: user.holdBalance, code: user.code});
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

							con.query(`insert into transaction (receiver, initiator, amount, isWithdrawl, type, transactionDate, status) values ('admin', '${username}', '${amount}', true, 'Organization', '${new Date().toString()}', 'PENDING')`, (err, result) => {
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

	app.post('/users/password', jsonParser, (req, res) => {
		const username = req.body.username;
		const currentPassword = req.body.currentPassword;
		const newPassword = req.body.newPassword;


		con.query(`select * from user where username='${username}' and password='${currentPassword}'`, (err, result) => {
			console.log(result)
			if (result && result.length) {
				con.query(`update user set password='${newPassword}' where username='${username}'`, (err, result) => {
					if (err) {
						console.log(err)
						throw new Error({message: 'Problem occured when changing password'});
					} else {
						res.status(200).json({message: 'Password updated' });
					}
				})
			} else {
				res.status(400).json({message: 'Password do not match'});
			}
		})
	})

	app.post('/vendors/password', jsonParser, (req, res) => {
		const username = req.body.username;
		const currentPassword = req.body.currentPassword;
		const newPassword = req.body.newPassword;


		con.query(`select * from vendor where username='${username}' and password='${currentPassword}'`, (err, result) => {
			console.log(result)
			if (result && result.length) {
				con.query(`update vendor set password='${newPassword}' where username='${username}'`, (err, result) => {
					if (err) {
						console.log(err)
						throw new Error({message: 'Problem occured when changing password'});
					} else {
						res.status(200).json({message: 'Password updated' });
					}
				})
			} else {
				res.status(400).json({message: 'Password do not match'});
			}
		})
	})


	app.post('/organizations/password', jsonParser, (req, res) => {
		const username = req.body.username;
		const currentPassword = req.body.currentPassword;
		const newPassword = req.body.newPassword;


		con.query(`select * from organization where username='${username}' and password='${currentPassword}'`, (err, result) => {
			console.log(result)
			if (result && result.length) {
				con.query(`update organization set password='${newPassword}' where username='${username}'`, (err, result) => {
					if (err) {
						console.log(err)
						throw new Error({message: 'Problem occured when changing password'});
					} else {
						res.status(200).json({message: 'Password updated' });
					}
				})
			} else {
				res.status(400).json({message: 'Password do not match'});
			}
		})
	})




})
