class SendMoneyUseCase {

	execute(sender, receiver, amount) {
		if (amount > sender.availableBalance)
			throw new Error("Insufficient balance");

		sender.availableBalance -= amount;
		receiver.availableBalance = Number(receiver.availableBalance) + Number(amount);

		if (sender.username === receiver.username) {
			receiver.availableBalance -= amount;
		}
	}
}

export default SendMoneyUseCase;
