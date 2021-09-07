import Transaction from './transaction.js';

class WithdrawMoneyUseCase {

	execute(user, vendor, amount) {
		if (amount > Number(user.availableBalance))
			throw new Error("Insufficient balance");

		user.holdBalance += amount;
		user.code = Math.floor(100000 + Math.random() * 900000);

		const transaction = new Transaction();
		transaction.initiator = user.username;
		transaction.remarks = `withdraw amount ${amount}`;
		transaction.code = user.code;
		vendor.transactions.push(transaction);
	}
}

export default WithdrawMoneyUseCase;
