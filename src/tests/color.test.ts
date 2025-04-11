import { expect, test } from "vitest";
import { invertColor } from "@/utils/color";

test("should invert RGB colors correctly", () => {
  expect(invertColor("rgb(255, 0, 0)")).toBe("rgb(0, 255, 255)");
});

test("should invert HSL colors correctly", () => {
  expect(invertColor("hsl(0, 100%, 50%)")).toBe("hsl(180, 100%, 50%)");
});

test("should invert hex colors correctly", () => {
  expect(invertColor("#ff0000")).toBe("#00ffff");
});

test("should invert RGBA colors with alpha channel", () => {
  expect(invertColor("rgba(200, 100, 50, 0.5)")).toBe("rgba(55, 155, 205, 0.5)");
});

test("should handle case-insensitive color formats", () => {
  expect(invertColor("RGB(255, 0, 0)")).toBe("rgb(0, 255, 255)");
  expect(invertColor("HSL(0, 100%, 50%)")).toBe("hsl(180, 100%, 50%)");
  expect(invertColor("#FF0000")).toBe("#00ffff");
});
