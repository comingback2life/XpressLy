import User from '../src/user.js';
import Vendor from '../src/vendor.js';
import Admin from '../src/admin.js';
import Organization from '../src/organization.js';
import Transaction from '../src/transaction.js';
import SendMoneyUseCase from '../src/sendMoney.usecase.js';
import WithdrawMoneyUseCase from '../src/withdrawMoney.usecase.js';
import ApproveTransactionUseCase from '../src/approveTransaction.usecase.js';
import {expect} from '@jest/globals';

const sendMoneyUseCase = new SendMoneyUseCase();

test('user can send money to another user', () => {
	const sender = createUser('sender', 'sender@example.com', '1234567890', 500)
	const receiver = createUser('receiver', 'receiver@example.com', '1111223459', 10);

	sendMoneyUseCase.execute(sender, receiver, 50);
	expect(sender.availableBalance).toBe(450);
	expect(receiver.availableBalance).toBe(60);
})

test('user can send money to organization', () => {
	const sender = createUser('sender', 'sender@example.com', '1234567890', 500)
	const receiver = new Organization();
	receiver.name = 'org';
	receiver.purposeStatement = 'no purpose';
	receiver.representativeFullName = 'Full Name';
	receiver.representativeContact = 'contact';

	sendMoneyUseCase.execute(sender, receiver, 200);

	expect(sender.availableBalance).toBe(300);
	expect(receiver.availableBalance).toBe(200);
})

test('user cannot send more money than they have', () => {
	const sender = createUser('sender', 'sender@example.com', '1234567890', 500);
	const receiver = createUser('receiver', 'receiver@example.com', '1111223459', 10);

	const error = () => sendMoneyUseCase.execute(sender, receiver, 600);
	expect(error).toThrow("Insufficient balance")
})

test('amount is hold when user withdraws', () => {
	const user = createUser('user', 'user@example.com', '1234567890', 500);
	const withdrawMoneyUseCase = new WithdrawMoneyUseCase();
	withdrawMoneyUseCase.execute(user, createVendor(), 300);
	expect(user.holdBalance).toBe(300);
})

test('vendor is notified when user withdraws', () => {
	const user = createUser('user', 'user@example.com', '1234567890', 500);
	const withdrawMoneyUseCase = new WithdrawMoneyUseCase();
	const vendor = createVendor();
	withdrawMoneyUseCase.execute(user, vendor, 300);
	const transactions = vendor.transactions;
	expect(transactions.length).toBe(1);
	expect(transactions[0].initiator).toBe('user');
	expect(transactions[0].remarks).toBe('withdraw amount 300');
})

test('user cannot withdraw more money than they have', () => {
	const user = createUser('user', 'user@example.com', '1234567890', 500);
	const withdrawMoneyUseCase = new WithdrawMoneyUseCase();
	const error = () => withdrawMoneyUseCase.execute(user, createVendor(), 900);
	expect(error).toThrow("Insufficient balance");
})

test('vendor can approve the transaction', () => {
	const vendor = createVendor();
	const user = createUser('user', 'user@example.com', '1234567890', 500);
	user.holdBalance = 300;

	const transaction = new Transaction();
	transaction.initiator = user;
	transaction.remarks = 'approve transaction';
	transaction.amount = 300;

	const admin = new Admin();
	admin.username = 'admin';
	admin.password = 'password';
	admin.fullName = 'Ad Min';
	admin.email = 'admin@example.com';

	const approveTransactionUseCase = new ApproveTransactionUseCase(admin);
	approveTransactionUseCase.execute(user, vendor, transaction);
	expect(vendor.balance).toBe(3);
	expect(admin.balance).toBe(3);
	expect(user.holdBalance).toBe(0);
	expect(user.availableBalance).toBe(194);
})

function createUser(username, email, phoneNumber, availableBalance) {
	const user = new User();
	user.username = username;
	user.password = 'password';
	user.email = email;
	user.fullName = 'First Last';
	user.phoneNumber = phoneNumber;
	user.location = 'Kathmandu, Nepal';
	user.availableBalance = availableBalance;
	return user;
}

function createVendor() {
	const vendor = new Vendor();
	vendor.username = 'vendorUsername';
	vendor.password = 'password';
	vendor.email = 'vendor@example.com';
	vendor.fullName = 'Vendor Name';
	vendor.location = 'Kathmandu';
	return vendor;
}
