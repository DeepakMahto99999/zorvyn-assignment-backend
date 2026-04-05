import Transaction from "../models/transaction.model.js";
import asyncHandler from "../middleware/asyncHandler.middleware.js";

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find();

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryTotals = {};
  const monthlyMap = {};

  transactions.forEach((t) => {
    // income / expense
    if (t.type === "income") {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
    }

    // category totals
    if (!categoryTotals[t.category]) {
      categoryTotals[t.category] = 0;
    }
    categoryTotals[t.category] += t.amount;

    // monthly trends
    const month = new Date(t.date).toLocaleString("default", {
      month: "short",
    });

    if (!monthlyMap[month]) {
      monthlyMap[month] = { income: 0, expense: 0 };
    }

    if (t.type === "income") {
      monthlyMap[month].income += t.amount;
    } else {
      monthlyMap[month].expense += t.amount;
    }
  });

  // convert monthlyMap → array
  const monthlyTrends = Object.entries(monthlyMap).map(
    ([month, data]) => ({
      month,
      ...data,
    })
  );

  // recent transactions (latest 5)
  const recentTransactions = await Transaction.find()
    .sort({ date: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      categoryTotals,
      recentTransactions,
      monthlyTrends,
    },
  });
});