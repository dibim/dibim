import { expect, test } from "vitest";
import { RE_IS_SINGLET_QUERY, RE_WHERE_CLAUSE } from "@/constants";

// Test suite for validating single-table query detection

// Basic single-table query - should pass
const sql1 = "SELECT * FROM users";
test(`should accept simple single-table query: ${sql1}`, () => {
  expect(RE_IS_SINGLET_QUERY.test(sql1)).toBe(true);
});

// Case insensitivity test - should pass
const sql2 = "SeLeCt id FROM orders";
test(`should be case-insensitive: ${sql2}`, () => {
  expect(RE_IS_SINGLET_QUERY.test(sql2)).toBe(true);
});

// Minimal valid query - should pass
const sql3 = "select * from table1";
test(`should accept minimal valid query: ${sql3}`, () => {
  expect(RE_IS_SINGLET_QUERY.test(sql3)).toBe(true);
});

// JOIN query - should reject
const sql4 = "SELECT * FROM users JOIN orders";
test(`should reject JOIN queries: ${sql4}`, () => {
  expect(RE_IS_SINGLET_QUERY.test(sql4)).toBe(false);
});

// Comma-separated tables - should reject
const sql5 = "SELECT * FROM table1, table2";
test(`should reject comma-separated tables: ${sql5}`, () => {
  expect(RE_IS_SINGLET_QUERY.test(sql5)).toBe(false);
});

// UNION query - should reject
const sql6 = "SELECT * FROM users UNION SELECT * FROM logs";
test(`should reject UNION queries: ${sql6}`, () => {
  expect(RE_IS_SINGLET_QUERY.test(sql6)).toBe(false);
});

// Subquery - should reject
const sql7 = "SELECT * FROM users WHERE id IN (SELECT id FROM temp)";
test(`should reject subqueries: ${sql7}`, () => {
  expect(RE_IS_SINGLET_QUERY.test(sql7)).toBe(false);
});

// Non-SELECT statement - should reject
const sql8 = "INSERT INTO users SELECT * FROM backup";
test(`should reject non-SELECT statements: ${sql8}`, () => {
  expect(RE_IS_SINGLET_QUERY.test(sql8)).toBe(false);
});

// Simple SELECT with semicolon - should accept
const sql9 = "select * from a_api;";
test(`should accept simple SELECT with semicolon: ${sql9}`, () => {
  expect(RE_IS_SINGLET_QUERY.test(sql9)).toBe(true);
});

// SELECT with quoted identifier - should accept
const sql10 = `select "id" from a_api;`;
test(`should accept SELECT with quoted identifier: ${sql10}`, () => {
  expect(RE_IS_SINGLET_QUERY.test(sql10)).toBe(true);
});

// SELECT with quoted identifier - should accept
const sql100 = "SELECT * FROM `users` WHERE age > 30;";
test(`should accept SELECT with quoted identifier: ${sql100}`, () => {
  expect(sql100.match(RE_WHERE_CLAUSE)?.[2] || "").toBe("WHERE age > 30;");
});

// SELECT with quoted identifier - should accept
const sql101 = 'SELECT * FROM "users" WHERE age > 30;';
test(`should accept SELECT with quoted identifier: ${sql101}`, () => {
  expect(sql101.match(RE_WHERE_CLAUSE)?.[2] || "").toBe("WHERE age > 30;");
});

// SELECT with quoted identifier - should accept
const sql102 = "SELECT * FROM 'users' WHERE age > 30;";
test(`should accept SELECT with quoted identifier: ${sql102}`, () => {
  expect(sql102.match(RE_WHERE_CLAUSE)?.[2] || "").toBe("WHERE age > 30;");
});

// SELECT with quoted identifier - should accept
const sql103 = "SELECT * FROM users WHERE age > 30;";
test(`should accept SELECT with quoted identifier: ${sql103}`, () => {
  expect(sql103.match(RE_WHERE_CLAUSE)?.[2] || "").toBe("WHERE age > 30;");
});

// SELECT with quoted identifier - should accept
const sql104 = "SELECT * FROM users;";
test(`should accept SELECT with quoted identifier: ${sql104}`, () => {
  expect(sql104.match(RE_WHERE_CLAUSE)?.[1] || "").toBe("users");
});

// SELECT with quoted identifier - should accept
const sql105 = " SELECT  *  FROM users ;";
test(`should accept SELECT with quoted identifier: ${sql105}`, () => {
  expect(sql105.match(RE_WHERE_CLAUSE)?.[1] || "").toBe("users");
});
