using System.ComponentModel.DataAnnotations;

namespace CalendarApi;

/// <summary>
/// A Guest booked on a slot; see GLOSSARY.md. Keeps the meeting type name and its own time as they
/// were at booking (ADR 0001), so it has no foreign key to the meeting type. Times are UTC.
/// </summary>
public class Meeting
{
    public Guid Id { get; set; }

    /// <summary>Only a reference: the meeting type may have been deleted since.</summary>
    public Guid MeetingTypeId { get; set; }

    public required string MeetingTypeName { get; set; }

    public required string GuestName { get; set; }

    public DateTime Start { get; set; }

    public DateTime End { get; set; }

    /// <summary>What the Guest wants to talk about; null when left empty.</summary>
    public string? Topic { get; set; }

    /// <summary>A meeting on the slot with a snapshot of the meeting type; the guest name trimmed.</summary>
    public static Meeting Book(MeetingType meetingType, string guestName, Slot slot, string? topic) => new()
    {
        MeetingTypeId = meetingType.Id,
        MeetingTypeName = meetingType.Name,
        GuestName = guestName.Trim(),
        Start = slot.Start,
        End = slot.End,
        Topic = topic,
    };
}

/// <summary>
/// Body of booking a slot. Nullable so that a missing field is a 400, not an empty GUID or a zero
/// time. The attributes see the text before trimming.
/// </summary>
public record MeetingInput(
    [Required] Guid? MeetingTypeId,
    [Required, MaxLength(100)] string GuestName,
    [Required] DateTimeOffset? Start,
    [MaxLength(500)] string? Topic);
