const Transaction = require("../models/transaction");
const User = require("../models/user");

module.exports = {
  fecthTransactions: async (req, res, limit = 5) =>
    (trans = await Transaction.find({})
      .limit(limit)
      .sort({ date: -1 })
      .populate({ path: "user", select: { fname: 1, lname: 1 } })),

  createTransaction: async (req, res, type = "deposit") => {
    const parsedBody = {
      ...req.body,
      payment_mode: "E-Wallet",
      walletaddress: "admin",
      user: req.params.userId,
    };
    // switch (parsedBody.payment_mode) {
    //   case "Ethereum":
    //     parsedBody.walletaddress = parsedBody.ethereum;
    //     break;
    //   case "Bitcoin":
    //     parsedBody.walletaddress = parsedBody.bitcoin;
    //     break;
    //   default:
    //     parsedBody.walletaddress = parsedBody.walletaddress;
    //     break;
    // }

    // active transaction since it's coming directly from admin
    parsedBody.status = "active";
    parsedBody.type = type;
    parsedBody.date = new Date();

    delete parsedBody.bitcoin;
    delete parsedBody.ethereum;
    const newTransaction = new Transaction({ ...parsedBody });
    const savedTrx = await newTransaction.save();

    // find user that creates the transaction
    const user = await User.findById(req.params.userId);
    // push the new trx into the user trx array
    user.transactions.push(savedTrx);
    // Update active amount
    user.balance.active += Number.parseFloat(req.body.amount);
    user.balance.total += Number.parseFloat(req.body.amount);
    await user.save();
  },
  updateTransaction: async (req, res) => {
    const trx = await Transaction.findById(req.body.trxId);
    const user = await User.findById(req.body.userId).populate(
      "transactions",
      "status -_id"
    );

    const len = user.transactions.filter(
      (trx) => trx.status === "active"
    ).length;
    console.log("LENGTH: " + len);
    trx["status"] = req.body.status;

    if (req.body.status === "active" && trx.type === "deposit") {
      user.balance.active += trx.amount;
      // Update Bonus Only For The First Transaction
      if (len === 0) {
        user.balance.bonus += (user.balance.active * 50) / 100;
      }
      user.balance.total =
        user.balance.active +
        user.balance.profit +
        user.balance.bonus +
        user.balance.ref_bonus;
    }

    if (req.body.status === "pending" && trx.type === "deposit") {
      user.balance.active -= trx.amount;
      // Update Bonus Only For The First Transaction
      if (len === 1) {
        user.balance.bonus -= (trx.amount * 50) / 100;
      }
      user.balance.total =
        user.balance.active +
        user.balance.profit +
        user.balance.bonus +
        user.balance.ref_bonus;
    }

    if (req.body.status === "active" && trx.type === "withdrawal") {
      user.balance.total = user.balance.total - trx.amount;
      // user.balance.active = user.balance.active - trx.amount;
    }

    if (req.body.status === "pending" && trx.type === "withdrawal") {
      user.balance.total = user.balance.total + trx.amount;
      // user.balance.active = user.balance.active - trx.amount;
    }

    await trx.save();
    await user.save();
    return res.status(200).json("done");
  },

  updateProfit: async (req, res) => {
    const user = await User.findById(req.body.userId);

    switch (req.body.what) {
      case "ADD":
        user.balance.profit = user.balance.active * 10;
        break;
      case "SUB":
        if (Number(user.balance.profit)) {
          user.balance.profit -= user.balance.active * 10;
        }
        break;
    }
    user.balance.total =
      user.balance.active +
      user.balance.profit +
      user.balance.bonus +
      user.balance.ref_bonus;
    await user.save();
    return res.status(200).json("done");
  },
};
