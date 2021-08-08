import Transaction from './transaction.js';

class VendorWithdrawUsecase {
	admin;

	constructor(admin) {
		this.admin = admin;
	}

	execute(vendor, amount, bankName, accountNumber) {
		const transaction = new Transaction();
		transaction.initiator = vendor.username;
		transaction.amount = amount;
		transaction.remarks = `withdraw request of amount ${amount} by ${vendor.username}`;
		this.admin.withdrawRequests.push(transaction);
		vendor.holdBalance += amount;
	}
}

export default VendorWithdrawUsecase;
