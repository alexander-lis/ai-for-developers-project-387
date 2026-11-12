# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual label strings used in this repo's issue tracker.

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`               | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | `ready-for-human`    | Requires human implementation            |
| `wontfix`                  | `wontfix`            | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.

Edit the "Label in our tracker" column to match whatever vocabulary you actually use.

## Auto-triage

`.github/workflows/opencode-triage.yml` triages every newly opened issue except those opened with `ready-for-agent`, `ready-for-human` or `wontfix`. Specs from `/to-spec` and tickets from `/to-tickets` are opened with `ready-for-agent`, so they are not triaged again. Auto-triage itself only sets a category label and `needs-info` or `needs-triage`; moving an issue further is the maintainer's call.
