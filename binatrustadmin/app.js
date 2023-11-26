const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");

// controllers
const transactionController = require("./controllers/transaction");
const userController = require("./controllers/user");
const plansController = require("./controllers/plan");

const uri = process.env.MONGODB_URL;

// Database connection
const main = async () => {
  await mongoose.connect(uri);
  app.use(express.static(path.join(__dirname, "public")));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.set("view engine", "ejs");
  app.set("views", "views");

  app.get("/", async (req, res) => {
    const fetchedPlans = await plansController.fetchPlans();
    if (fetchedPlans.length == 0) {
      plansController.savePlan();
    }
    const transactions = await transactionController.fecthTransactions(
      req,
      res
    );
    res.render("landing", { transactions });
  });

  app.get("/users", async (req, res) => {
    const users = await userController.fecthUsers(req, res);
    res.render("tables-users", { users });
  });

  app.get("/users/:userId", async (req, res) => {
    userController.fetchUser(req, res);
  });

  app.delete("/users/delete", async (req, res) => {
    userController.deleteUser(req, res);
  });

  // plans
  app.get("/plans", async (req, res) => {
    const plan = await plansController.fetchPlan(req.query.type);
    res.render("plans", { plan });
  });

  app.put("/plans", async (req, res) => {
    await plansController.updatePlan(req, res);
  });

  app.get("/calendar", (req, res) => {
    res.render("calendar");
  });

  app.put("/transactions", async (req, res) => {
    if (req.body.what) {
      transactionController.updateProfit(req, res);
    } else {
      transactionController.updateTransaction(req, res);
    }
  });

  app.post("/admin/deposit/:userId", (req, res) => {
    transactionController.createTransaction(req, res);
    res.redirect("/users");
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`App running at http://localhost:${PORT}`);
  });
};

// Execute main
main();
