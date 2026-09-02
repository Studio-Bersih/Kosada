# Changelog

Kosada frontend. Newest first.

## Unreleased

### Added
- `<Rupiah>` — a nominal input that groups thousands as you type, so
  `1000000` reads `1.000.000`. Caret position survives the reformat and
  backspace over a separator deletes the digit beyond it, so the middle of a
  number stays editable.

### Changed
- Transfer Harian: "Uang yang harus ditransfer" uses `<Rupiah>` instead of a
  bare `type="number"` field. The value sent to the API is unchanged.
