# Changelog

Kosada frontend. Newest first.

## Unreleased

### Added
- `<Rupiah>` — a nominal input that groups thousands as you type, so
  `1000000` reads `1.000.000`. Caret position survives the reformat and
  backspace over a separator deletes the digit beyond it, so the middle of a
  number stays editable.

- Transfer Harian: an `Ubah` action on each recorded row. Administrator-only,
  like `Hapus`. The form edits jenis, nominal and keterangan; the confirmation
  step then names the change ("nominal Rp1.000.000 menjadi Rp1.500.000") before
  asking for the administrator's password. Nama and instansi are read-only.

### Changed
- Transfer Harian: "Uang yang harus ditransfer" uses `<Rupiah>` instead of a
  bare `type="number"` field. The value sent to the API is unchanged.
