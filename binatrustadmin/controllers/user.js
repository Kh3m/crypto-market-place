const User = require("../models/user")
const Transaction = require("../models/transaction")

module.exports = {
    fecthUsers: async (req, res) => trans = await User.find({})
    // .populate({path: "user", select: {"fname": 1, "lname": 1, "_id": 0}})
    ,
    fetchUser: async (req, res) => {
        const userId = req.params.userId;
        const user = await User.findById(userId).populate("transactions")
        res.status(200).json(user)
    },

    deleteUser: async (req, res) => {
        const user = await User.findByIdAndRemove(req.body.userId)
        await Transaction.deleteMany({
            _id: {$in: [...user.transactions]}
        })

        return res.status(200).json("done");
    },







    saveUser: async (req, res) => {
        // check for password_confirmation
        if(!(req.body.password === req.body.password_confirmation)){
            return "PASSWORD_MISMATCH"
        }
        
        // remove password_confirmation field
        delete req.body.password_confirmation  
        req.body.email = req.body.email.toLowerCase().trim()
        balance = {
            profit: 0.00,
            bonus: 10,
            ref_bonus: 0.00,
            active: 0.00,
            total: 10
        }
        // Check if user already exists
        const foundUser = await User.findOne({email: req.body.email});
        if(foundUser) {
            return "USER_EXISTS"
        }

        // Create new user
        const newUser = new User({...req.body, balance: {...balance}});
        const savedUser = await newUser.save();

        return savedUser;
    },
    updateUser: async (req, res, what="WITHDRAWAL_INFO") => {
        const userId = req.user._id
        let data = null;

        const user = await User.findById(userId)

        switch(what) {
            case "WITHDRAWAL_INFO":
                data = {
                    bank: {
                        bank_name: req.body.bank_name,
                        account_name: req.body.actname,
                        account_number: req.body.actnum,
                        routing_number: req.body.routnum
                    },
                    crypto: {
                        btc_address: req.body.btc_address
                    },
                    cash_app: {
                        cash_app_tag: req.body.cash_app_tag
                    }
                }
                user.withdrawal_info = {...data}
                break
            case "PASSWORD":
                if(req.body.password !== req.body.password_confirmation) {
                    return res.status(401).json("Password doesn't match")
                }
                if(user.password !== req.body.old_password) {
                    return res.status(401).json("Incorrect password")
                }
                user.password = req.body.password
                break
        }
        
        await user.save();
        res.status(200).json("done")
    },
    loginUser: async (req, res) => {
        console.log(req.body)
        const user = await User.findOne({email: req.body.email});
        if(!user || !(req.body.password === user.password) ) return res.status(401)
        .json({error: "Incorrect email or password"})

        req.session.userId = user._id
        res.status(200).json("login")
    }
}
