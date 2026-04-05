import Transaction from "../models/transaction.model.js";
import asyncHandler from "../middleware/asyncHandler.middleware.js";


//  Formatter (clean API response)
const formatTransaction = (t) => ({
  id: t._id.toString(),
  amount: t.amount,
  type: t.type,
  category: t.category,
  date: t.date,
  notes: t.notes,
  createdBy: t.createdBy,
});


//  CREATE (Admin only)
export const createTransaction = asyncHandler(async (req, res) => {
  let { amount, type, category, date, notes } = req.body;

  type = type?.trim().toLowerCase();
  category = category?.trim().toLowerCase();

  const transaction = await Transaction.create({
    amount,
    type,
    category,
    date,
    notes,
    createdBy: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: "Transaction created",
    transaction: formatTransaction(transaction),
  });
});


//  GET ALL (FILTER + PAGINATION + SORT)
export const getTransactions = asyncHandler(async (req, res) => {
  let {
    type,
    category,
    from,
    to,
    page = 1,
    limit = 10,
    sort = "date",
  } = req.query;

  const filter = {};

  // normalize filters
  if (type) filter.type = type.toLowerCase();
  if (category) filter.category = category.toLowerCase();

  // date filter
  if (from && to) {
    const start = new Date(from);
    const end = new Date(to);

    if (isNaN(start) || isNaN(end)) {
      const error = new Error("Invalid date format");
      error.statusCode = 400;
      throw error;
    }

    filter.date = { $gte: start, $lte: end };
  }

  // pagination
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  // sorting (safe)
  const allowedSort = ["date", "amount"];
  const sortField = allowedSort.includes(sort) ? sort : "date";

  const transactions = await Transaction.find(filter)
    .sort({ [sortField]: -1 })
    .skip(skip)
    .limit(limitNum)
    .populate("createdBy", "email role");

  const total = await Transaction.countDocuments(filter);

  const formatted = transactions.map(formatTransaction);

  res.status(200).json({
    success: true,
    count: formatted.length,
    total,
    page: pageNum,
    transactions: formatted,
  });
});


//  GET ONE
export const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).populate(
    "createdBy",
    "email role"
  );

  if (!transaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    transaction: formatTransaction(transaction),
  });
});


//  UPDATE (Admin only)
export const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  let { type, category } = req.body;

  // normalize fields
  if (type) transaction.type = type.trim().toLowerCase();
  if (category) transaction.category = category.trim().toLowerCase();

  Object.assign(transaction, req.body);

  await transaction.save();

  res.status(200).json({
    success: true,
    message: "Transaction updated",
    transaction: formatTransaction(transaction),
  });
});


//  DELETE (Admin only)
export const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  await transaction.deleteOne();

  res.status(200).json({
    success: true,
    message: "Transaction deleted",
  });
});