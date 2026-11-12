import { useId, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { meetingsCreate, type Meeting, type Slot } from "@/client";
import { validateBookingForm, type BookingFormErrors } from "@/booking-form";
import { formatTimeRange } from "@/calendar-time";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { checkInput, serverUnavailable } from "@/messages";

/**
 * How a booking ended for the screen: booked (201), the slot is no longer free (409), or the
 * meeting type was deleted (404). Bad input and network failures keep the dialog open.
 */
export type BookingOutcome =
  | { status: "booked"; meeting: Meeting }
  | { status: "conflict" }
  | { status: "meetingTypeDeleted" };

export type BookingTarget = { meetingTypeId: string; meetingTypeName: string; slot: Slot };

/** Asks the Guest's name and books the slot. */
export function BookingDialog({
  open,
  target,
  timeZone,
  onOpenChange,
  onDone,
}: {
  open: boolean;
  /** Kept while the dialog closes, so the closing animation shows the same text. */
  target?: BookingTarget;
  timeZone: string;
  onOpenChange: (open: boolean) => void;
  onDone: (outcome: BookingOutcome) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {target && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Записаться на встречу</DialogTitle>
            <DialogDescription>
              {target.meetingTypeName}, {formatTimeRange(target.slot, timeZone)}
            </DialogDescription>
          </DialogHeader>
          {/* The popup unmounts when closed, so every opening starts with an empty name. */}
          <BookingForm target={target} onDone={onDone} />
        </DialogContent>
      )}
    </Dialog>
  );
}

function BookingForm({
  target,
  onDone,
}: {
  target: BookingTarget;
  onDone: (outcome: BookingOutcome) => void;
}) {
  const id = useId();
  const [guestName, setGuestName] = useState("");
  const [topic, setTopic] = useState("");
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const checked = validateBookingForm({ guestName, topic });
    if ("errors" in checked) {
      setErrors(checked.errors);
      return;
    }

    setFormError(undefined);
    setSubmitting(true);
    const { data, error, response } = await meetingsCreate({
      body: {
        meetingTypeId: target.meetingTypeId,
        guestName: checked.guestName,
        ...(checked.topic && { topic: checked.topic }),
        start: target.slot.start,
      },
    });
    setSubmitting(false);

    if (data) {
      onDone({ status: "booked", meeting: data });
    } else if (response?.status === 409) {
      onDone({ status: "conflict" });
    } else if (response?.status === 404) {
      onDone({ status: "meetingTypeDeleted" });
    } else if (response?.status === 400) {
      // The form checks the fields first, so this is rare; a field the form does not show has
      // nothing to point at.
      const serverErrors: Record<string, string[] | undefined> =
        error && "errors" in error ? error.errors : {};
      const fieldErrors: BookingFormErrors = {};
      if (serverErrors.guestName?.length) {
        fieldErrors.guestName = serverErrors.guestName.join(" ");
      }
      if (serverErrors.topic?.length) {
        fieldErrors.topic = serverErrors.topic.join(" ");
      }
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        setFormError(checkInput);
      }
    } else {
      toast.error(serverUnavailable);
    }
  }

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="flex flex-col gap-4">
      <FieldGroup>
        <Field data-invalid={Boolean(errors.guestName)}>
          <FieldLabel htmlFor={`${id}-guestName`}>Имя</FieldLabel>
          <Input
            id={`${id}-guestName`}
            value={guestName}
            aria-invalid={Boolean(errors.guestName)}
            autoComplete="name"
            onChange={(event) => {
              setGuestName(event.target.value);
              setErrors({});
            }}
          />
          <FieldError>{errors.guestName}</FieldError>
        </Field>
        <Field data-invalid={Boolean(errors.topic)}>
          <FieldLabel htmlFor={`${id}-topic`}>О чём хотите поговорить</FieldLabel>
          <Textarea
            id={`${id}-topic`}
            value={topic}
            aria-invalid={Boolean(errors.topic)}
            onChange={(event) => {
              setTopic(event.target.value);
              setErrors({});
            }}
          />
          <FieldError>{errors.topic}</FieldError>
        </Field>
      </FieldGroup>
      <FieldError>{formError}</FieldError>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Отмена</DialogClose>
        <Button type="submit" disabled={submitting}>
          Подтвердить
        </Button>
      </DialogFooter>
    </form>
  );
}
