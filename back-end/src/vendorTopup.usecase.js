import Transaction from "./transaction.js";

class VendorTopupUsecase {
  initiate(vendor, amount) {
    const transaction = new Transaction();
    transaction.amount = amount;
    transaction.initiator = vendor.username;
    transaction.remarks = `Topup request of amount ${amount} by ${vendor.username}`;
  }
}

export default VendorTopupUsecase;
