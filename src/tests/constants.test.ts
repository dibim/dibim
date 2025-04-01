import { expect, test } from "vitest";
import { reIsSingletQuery } from "@/constants";

// Test suite for validating single-table query detection

// Basic single-table query - should pass
const sql1 = "SELECT * FROM users";
test(`should accept simple single-table query: ${sql1}`, () => {
  expect(reIsSingletQuery.test(sql1)).toBe(true);
});

// Case insensitivity test - should pass
const sql2 = "SeLeCt id FROM orders";
test(`should be case-insensitive: ${sql2}`, () => {
  expect(reIsSingletQuery.test(sql2)).toBe(true);
});

// Minimal valid query - should pass
const sql3 = "select * from table1";
test(`should accept minimal valid query: ${sql3}`, () => {
  expect(reIsSingletQuery.test(sql3)).toBe(true);
});

// JOIN query - should reject
const sql4 = "SELECT * FROM users JOIN orders";
test(`should reject JOIN queries: ${sql4}`, () => {
  expect(reIsSingletQuery.test(sql4)).toBe(false);
});

// Comma-separated tables - should reject
const sql5 = "SELECT * FROM table1, table2";
test(`should reject comma-separated tables: ${sql5}`, () => {
  expect(reIsSingletQuery.test(sql5)).toBe(false);
});

// UNION query - should reject
const sql6 = "SELECT * FROM users UNION SELECT * FROM logs";
test(`should reject UNION queries: ${sql6}`, () => {
  expect(reIsSingletQuery.test(sql6)).toBe(false);
});

// Subquery - should reject
const sql7 = "SELECT * FROM users WHERE id IN (SELECT id FROM temp)";
test(`should reject subqueries: ${sql7}`, () => {
  expect(reIsSingletQuery.test(sql7)).toBe(false);
});

// Non-SELECT statement - should reject
const sql8 = "INSERT INTO users SELECT * FROM backup";
test(`should reject non-SELECT statements: ${sql8}`, () => {
  expect(reIsSingletQuery.test(sql8)).toBe(false);
});
