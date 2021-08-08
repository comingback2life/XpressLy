class ApproveTransactionUseCase {
	admin;

	constructor(admin) {
		this.admin = admin;
	}

	execute(user, vendor, transaction) {
		const deductBalance = transaction.amount * 0.01;
		vendor.balance += deductBalance;
		this.admin.balance += deductBalance;
		user.holdBalance -= transaction.amount; 
		user.availableBalance -= (transaction.amount + (2 * deductBalance));
	}
}

export default ApproveTransactionUseCase;
