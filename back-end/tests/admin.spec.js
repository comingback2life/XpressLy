import Admin from '../src/admin.js';
import Vendor from '../src/vendor.js';
import AdminTopupUseCase from '../src/adminTopup.usecase.js';
import {expect} from '@jest/globals';

test('admin should be able to topup to vendor', () => {
	const admin = new Admin();
	admin.username = 'admin';
	admin.password = 'password';
	admin.fullName = 'Ad Min';
	admin.email = 'admin@example.com';
	admin.balance = '1000';

	const vendor = createVendor();
	const adminTopupUsecase = new AdminTopupUseCase(admin);
	adminTopupUsecase.execute(vendor, 500);
	expect(vendor.balance).toBe(500);
})

test('admin should not be able to topup to vendor more than money they have', () => {
	const admin = new Admin();
	admin.username = 'admin';
	admin.password = 'password';
	admin.fullName = 'Ad Min';
	admin.email = 'admin@example.com';
	admin.balance = '1000';

	const vendor = createVendor();
	const adminTopupUsecase = new AdminTopupUseCase(admin);
	const error = () => adminTopupUsecase.execute(vendor, 1500);
	expect(error).toThrow('Insufficient balance');
})

function createVendor() {
	const vendor = new Vendor();
	vendor.username = 'vendorUsername';
	vendor.password = 'password';
	vendor.email = 'vendor@example.com';
	vendor.fullName = 'Vendor Name';
	vendor.location = 'Kathmandu';
	return vendor;
}
