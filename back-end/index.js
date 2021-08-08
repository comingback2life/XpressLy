//const DbConnection = require('./src/dbconnection.js').DbConnection;
//const User = require('./src/user.js').User;

import User from './src/user.js'
import Vendor from './src/vendor.js'
import DbConnection from './src/dbconnection.js';
import SendMoneyUseCase from './src/sendMoney.usecase.js';
import WithdrawMoneyUseCase from './src/withdrawMoney.usecase.js';
//const express = require('express');
import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';

const app = express();
const jsonParser = bodyParser.json()

const dbConnection = new DbConnection();
const con = dbConnection.connect();

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


	app.post('/login', jsonParser, (req, res) => {
		//const token = connection.selectUser(req.body.username, req.body.password);
		const userType = req.body.isVendor ? 'vendor': 'user';

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
				else
					fullName = result[0].fullName;

				availableBalance = result[0].availableBalance;
				holdBalance = result[0].holdBalance;

				console.log({token, fullName, availableBalance, holdBalance})
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
										if (err) {
											throw new Error({message: 'Error updating receiver'});
										} else {
											res.status(200).json({message: 'Money successfully sent'});
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
									res.status(200).json({message: 'Withdraw request sent to vendor.', holdBalance: user.holdBalance});
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
})
