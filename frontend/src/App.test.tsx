import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { calendarGet, meetingsList, type Meeting } from "@/client";
import App from "./App";

// The meetings screens load from the API; these tests give it the meetings they need.
vi.mock("@/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/client")>()),
  calendarGet: vi.fn(),
  meetingsList: vi.fn(),
}));

const meeting: Meeting = {
  id: "5c0f6f1e-0d5e-4a7e-9a3b-2f1d9c8b7a61",
  meetingTypeId: "9b1e2a3c-4d5f-4a6b-8c7d-0e1f2a3b4c5d",
  meetingTypeName: "Знакомство",
  guestName: "Анна",
  start: "2026-11-10T07:00:00Z",
  end: "2026-11-10T08:00:00Z",
  topic: "Вопрос про тариф",
};

function givenMeetings(meetings: Meeting[]) {
  vi.mocked(calendarGet).mockResolvedValue({
    data: { timeZone: "Europe/Moscow" },
  } as Awaited<ReturnType<typeof calendarGet>>);
  vi.mocked(meetingsList).mockResolvedValue({
    data: meetings,
  } as Awaited<ReturnType<typeof meetingsList>>);
}

function renderApp(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  givenMeetings([]);
});

// Без globals: true в Vitest Testing Library не чистит DOM сама
afterEach(cleanup);

it("shows the home page", () => {
  renderApp();

  expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
    "встреча уже в календаре",
  );
  expect(screen.getByRole("link", { name: "Записаться на звонок" })).toBeTruthy();
});

it("opens the booking page from the home page", async () => {
  renderApp();

  await userEvent.click(screen.getByRole("link", { name: "Записаться на звонок" }));

  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Запись");
});

it("switches navigation when entering as owner", async () => {
  renderApp();

  await userEvent.click(screen.getByRole("button", { name: "Войти как владелец" }));

  const nav = screen.getByRole("navigation", { name: "Основная навигация" });
  expect(nav.textContent).toContain("Типы встреч");
  expect(nav.textContent).not.toContain("Запись");
  expect(screen.queryByRole("link", { name: "Записаться на звонок" })).toBeNull();
  expect(screen.getByRole("button", { name: "Выйти" })).toBeTruthy();
});

it("shows the topic of a meeting to the owner", async () => {
  givenMeetings([meeting]);
  localStorage.setItem("calendar.role", "owner");

  renderApp("/owner/meetings");

  expect(await screen.findByText("Вопрос про тариф")).toBeTruthy();
  expect(screen.getByRole("region", { name: "Тема" }).textContent).toContain("Вопрос про тариф");
});

it("does not show the topic to the guest on the upcoming meetings page", async () => {
  givenMeetings([meeting]);

  renderApp("/meetings");

  expect(await screen.findByText("Анна")).toBeTruthy();
  expect(screen.queryByRole("region", { name: "Тема" })).toBeNull();
  expect(screen.queryByText("Вопрос про тариф")).toBeNull();
});

it("shows no topic block for a meeting without topic", async () => {
  givenMeetings([{ ...meeting, topic: undefined }]);
  localStorage.setItem("calendar.role", "owner");

  renderApp("/owner/meetings");

  expect(await screen.findByText("Анна")).toBeTruthy();
  expect(screen.queryByRole("region", { name: "Тема" })).toBeNull();
});
