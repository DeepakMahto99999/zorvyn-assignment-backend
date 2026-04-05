import Transaction from "../models/transaction.model.js";
import asyncHandler from "../middleware/asyncHandler.middleware.js";

// 1. CATEGORY INSIGHTS  --> Total amount per category
export const getCategoryInsights = asyncHandler(async (req, res) => {
  const result = await Transaction.aggregate([
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
      },
    },
  ]);

  // convert format
  const formatted = {};
  result.forEach((item) => {
    formatted[item._id] = item.total;
  });

  res.status(200).json({
    success: true,
    data: formatted,
  });
});


// 2. Months TRENDS   --> Month-wise income vs expense
export const getTrends = asyncHandler(async (req, res) => {
  const result = await Transaction.aggregate([
    {
      $group: {
        _id: {
          month: { $month: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
  ]);

  const monthMap = {};

  result.forEach((item) => {
    const month = item._id.month;
    const type = item._id.type;

    if (!monthMap[month]) {
      monthMap[month] = { income: 0, expense: 0 };
    }

    monthMap[month][type] = item.total;
  });

  // convert to array
  const trends = Object.entries(monthMap).map(([month, data]) => ({
    month: Number(month),
    ...data,
  }));

  res.status(200).json({
    success: true,
    data: trends,
  });
});



// 3. INCOME VS EXPENSE    --> Total comparision
export const getIncomeVsExpense = asyncHandler(async (req, res) => {
  const result = await Transaction.aggregate([
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);

  let income = 0;
  let expense = 0;

  result.forEach((item) => {
    if (item._id === "income") income = item.total;
    if (item._id === "expense") expense = item.total;
  });

  res.status(200).json({
    success: true,
    data: {
      income,
      expense,
    },
  });
});