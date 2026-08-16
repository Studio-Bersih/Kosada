import { marketing } from "$lib/strings/marketing"
import { kumpulanProvinsi } from "$lib/strings/provinsi"

export const load = () => {
    return {
        provinsi    : kumpulanProvinsi,
        marketing   : marketing
    }
}