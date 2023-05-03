/*
  todo.js -- Router for the ToDoList
*/
const express = require("express");
const router = express.Router();
const TransactionItem = require("../models/TransactionItem");
const User = require("../models/User");
const mongoose = require("mongoose");
/*
this is a very simple server which maintains a key/value
store using an object where the keys and values are lists of strings

*/

isLoggedIn = (req, res, next) => {
  if (res.locals.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

// get the value associated to the key
router.get("/transaction/", isLoggedIn, async (req, res, next) => {
  const sortBy = req.query.sortBy;
  let items = [];
  if (sortBy == "category") {
    items = await TransactionItem.find({ userId: req.user._id }).sort({
      category: 1,
      date: 1,
      amount: 1,
    });
  } else if (sortBy == "amount") {
    items = await TransactionItem.find({ userId: req.user._id }).sort({
      amount: 1,
    });
  } else if (sortBy == "description") {
    items = await TransactionItem.find({ userId: req.user._id }).sort({
      description: 1,
    });
  } else if (sortBy == "date") {
    items = await TransactionItem.find({ userId: req.user._id }).sort({
      date: 1,
    });
  } else {
    items = await TransactionItem.find({ userId: req.user._id }).sort({
      date: 1,
    });
  }
  res.render("transactionList", { items, sortBy });
});

/* add the value in the body to the list associated to the key */
router.post("/transaction", isLoggedIn, async (req, res, next) => {
  const transaction = new TransactionItem({
    description: req.body.description,
    amount: req.body.amount,
    category: req.body.category,
    date: req.body.date,
    userId: req.user._id,
  });
  await transaction.save();
  res.redirect("/transaction");
});

router.get(
  "/transaction/remove/:itemId",
  isLoggedIn,
  async (req, res, next) => {
    console.log("inside /transaction/remove/:itemId");
    await TransactionItem.deleteOne({ _id: req.params.itemId });
    res.redirect("/transaction");
  }
);

router.get("/transaction/edit/:itemId", isLoggedIn, async (req, res, next) => {
  console.log("inside /transaction/edit/:itemId");
  const item = await TransactionItem.findById(req.params.itemId);
  res.render("transactionEdit", { item });
});

router.post(
  "/transaction/updateTransactionItem",
  isLoggedIn,
  async (req, res, next) => {
    const { itemId, description, amount, category, date } = req.body;
    console.log("inside /transaction/updateTransactionItem");
    await TransactionItem.findOneAndUpdate(
      { _id: itemId },
      { $set: { description, amount, category, date } }
    );
    res.redirect("/transaction");
  }
);

router.get("/transaction/byCategory", isLoggedIn, async (req, res, next) => {
  let id = req.user._id;
  let results = await TransactionItem.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(id) } },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
      },
    },
    { $sort: { total: -1 } },
  ]);
  //res.json(results);
  res.render("transactionByCategory", { results });
});

module.exports = router;
