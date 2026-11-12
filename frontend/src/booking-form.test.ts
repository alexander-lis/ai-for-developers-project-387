import { expect, it } from "vitest";
import { validateBookingForm } from "./booking-form";

it("trims the guest name", () => {
  expect(validateBookingForm({ guestName: "  Анна\n" })).toEqual({ guestName: "Анна" });
});

it.each([
  ["", "Введите имя"],
  ["   ", "Введите имя"],
  ["а".repeat(101), "Не длиннее 100 символов"],
])("rejects guest name %j with %s", (guestName, message) => {
  expect(validateBookingForm({ guestName })).toEqual({ errors: { guestName: message } });
});

it("leaves out a topic that is empty or only spaces", () => {
  expect(validateBookingForm({ guestName: "Анна", topic: "  \n" })).toEqual({ guestName: "Анна" });
  expect(validateBookingForm({ guestName: "Анна", topic: "" })).toEqual({ guestName: "Анна" });
});

it("keeps a topic, trimmed", () => {
  expect(validateBookingForm({ guestName: "Анна", topic: " Тариф " })).toEqual({
    guestName: "Анна",
    topic: "Тариф",
  });
});

it("counts the length after trimming", () => {
  expect(validateBookingForm({ guestName: ` ${"а".repeat(100)} ` })).toEqual({
    guestName: "а".repeat(100),
  });
});
