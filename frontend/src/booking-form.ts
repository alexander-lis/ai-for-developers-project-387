/** What the Guest typed into the booking form. */
export type BookingFormValues = { guestName: string; topic?: string };

export type BookingFormErrors = Partial<Record<keyof BookingFormValues, string>>;

/**
 * Checks the form by the contract rules; the guest name comes back trimmed. The topic comes back
 * trimmed too, and is left out when it is empty.
 */
export function validateBookingForm(
  values: BookingFormValues,
): { guestName: string; topic?: string } | { errors: BookingFormErrors } {
  const guestName = values.guestName.trim();
  if (!guestName) {
    return { errors: { guestName: "Введите имя" } };
  }
  if (guestName.length > 100) {
    return { errors: { guestName: "Не длиннее 100 символов" } };
  }
  const topic = values.topic?.trim() ?? "";
  return topic ? { guestName, topic } : { guestName };
}
