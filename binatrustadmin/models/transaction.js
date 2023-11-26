const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const transactionSchema = mongoose.Schema({
  type: String, // withdral | deposit
  amount: Number,
  payment_mode: String, // Bitcoin | Ethereum | etc
  status: String, // active | pending
  date: { type: Date, default: Date.now() },
  walletaddress: String,
  user: {
    type: ObjectId,
    ref: "User",
  }, // user's id that initiates the transaction
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
