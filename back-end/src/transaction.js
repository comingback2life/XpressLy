class Transaction {
	receiver;
	initiator;
	remarks;
	amount = 0;
	isWithdrawl = false;
	type;
	transactionDate = Date.now();
	id;
	status;
}

export default Transaction;
