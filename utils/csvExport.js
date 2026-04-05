import { Parser } from "json2csv";

export const generateCSV = (data) => {
  const fields = [
    "amount",
    "type",
    "category",
    "date",
    "notes",
  ];

  const parser = new Parser({ fields });

  return parser.parse(data);
};