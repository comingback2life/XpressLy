import VendorTopupUsecase from '../src/vendorTopup.usecase.js';
import VendorWithdrawUsecase from '../src/vendorWithdraw.usecase.js';
import Admin from '../src/admin.js';
import Vendor from '../src/vendor.js';
import {expect} from '@jest/globals';

test('vendor can initiate topup request to admin', () => {
	const admin = createAdmin();
	const vendorTopupUsecase = new VendorTopupUsecase(admin);
	vendorTopupUsecase.initiate(createVendor(), 500);
	expect(admin.topupRequests.length).toBe(1);
	expect(admin.topupRequests[0].initiator).toBe('vendorUsername');
	expect(admin.topupRequests[0].remarks).toBe('topup request of amount 500 by vendorUsername');
	expect(admin.topupRequests[0].amount).toBe(500);
})

test('vendor can initiate withdraw request to admin', () => {
	const admin = createAdmin();
	const vendor = createVendor();
	const vendorWithdrawUseCase = new VendorWithdrawUsecase(admin);
	vendorWithdrawUseCase.execute(vendor, 500, 'NRB', '123456');
	expect(vendor.holdBalance).toBe(500);
	expect(admin.withdrawRequests.length).toBe(1);
	expect(admin.withdrawRequests[0].initiator).toBe('vendorUsername');
	expect(admin.withdrawRequests[0].amount).toBe(500);
	expect(admin.withdrawRequests[0].remarks).toBe('withdraw request of amount 500 by vendorUsername');
})

function createAdmin() {
	const admin = new Admin();
	admin.username = 'admin';
	admin.password = 'password';
	admin.fullName = 'Ad Min';
	admin.email = 'admin@example.com';
	return admin;
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
