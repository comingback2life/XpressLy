import Transaction from './transaction.js';

class VendorWithdrawUsecase {
	admin;

	constructor(admin) {
		this.admin = admin;
	}

	execute(organization, amount, bankName, accountNumber) {
		const transaction = new Transaction();
		transaction.initiator = organization.username;
		transaction.amount = amount;
		transaction.remarks = `withdraw request of amount ${amount} by ${organization.username} with bank ${bankName} and account number ${accountNumber}`;
		this.admin.withdrawRequests.push(transaction);
		organization.holdBalance += amount;
	}
}

export default VendorWithdrawUsecase;
