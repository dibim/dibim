import { expect, test } from "vitest";
import { extractTableNames } from "@/databases/utils";

// Test suite for validating multi-table query detection with different quote styles

// Complex multi-table query - should pass
const sql1 = `
  UPDATE "users" 
  SET name = 'John' 
  WHERE id = 1 
  JOIN [orders] 
  ON users.id = orders.user_id
  JOIN 'products' 
  ON orders.product_id = products.id;
`;
test(`should extract table names from a multi-table query with different quote styles: ${sql1}`, () => {
  expect(extractTableNames(sql1)).toStrictEqual(["users", "orders", "products"]);
});
