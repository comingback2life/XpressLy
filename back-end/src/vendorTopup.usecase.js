import Transaction from './transaction.js';

class VendorTopupUsecase {
	admin;

	constructor(admin) {
		this.admin = admin;
	}

	initiate(vendor, amount) {
		const transaction = new Transaction();
		transaction.amount = amount;
		transaction.initiator = vendor.username
		transaction.remarks = `topup request of amount ${amount} by ${vendor.username}`;

		this.admin.topupRequests.push(transaction);
	}
}

export default VendorTopupUsecase;
