class AdminTopupUseCase {
	admin;

	constructor(admin) {
		this.admin = admin;
	}

	execute(vendor, amount) {
		if (amount > this.admin.balance)
			throw new Error('Insufficient balance');

		vendor.balance += amount;
		this.admin.balance -= amount;
	}
}

export default AdminTopupUseCase;
