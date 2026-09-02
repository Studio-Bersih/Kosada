<script lang="ts">
    /*
    | A nominal field that groups thousands as you type — 1000000 reads 1.000.000.
    |
    | This is a text input, not `type="number"`. A number input cannot show a
    | grouping separator at all: the browser parses its own value, and "1.000.000"
    | is not a number to it, so the field silently blanks. So the digits are held
    | as text here and the parsed integer is handed back through `value`.
    |
    | `value` is a number (or null when empty), never the formatted string. Callers
    | keep sending NOMINAL to the API exactly as before; the formatting is a display
    | concern that does not leak into the payload.
    |
    | Two details that are invisible when they work and maddening when they don't:
    |
    |   1. The caret. Reformatting on every keystroke rewrites the whole string,
    |      which sends the cursor to the end — so correcting the middle of a number
    |      becomes impossible. The caret is therefore restored by DIGIT position,
    |      not by character offset, since separators shift as the number grows.
    |
    |   2. Backspace over a separator. Deleting the "." from "1.000" leaves "1000",
    |      which reformats straight back to "1.000" — the key appears dead. So a
    |      backspace landing on a separator deletes the digit beyond it instead,
    |      which is what the user meant. Delete is handled the same way forwards.
    */
    import { tick } from 'svelte';
    import { formatRibuan, parseRibuan } from '$lib/formatter';

    export let value:number|null = null;
    export let id:string         = '';
    export let placeholder       = '0';
    export let disabled          = false;
    export let ariaLabel:string  = '';

    let klass = 'input input-bordered';
    export { klass as class };

    let element:HTMLInputElement;
    let text:string = formatRibuan(value);

    /*
    | Re-render when `value` is set from outside — picking a loan runs isiNominal()
    | and assigns the nominal directly. Guarded by comparing the PARSED text so a
    | keystroke, which sets both together, doesn't fight its own reformat.
    */
    $: if(parseRibuan(text) !== value) text = formatRibuan(value);

    function countDigits(part:string):number {
        return (part.match(/\d/g) ?? []).length;
    }

    /* The offset just after the nth digit of `formatted`. */
    function caretAfterDigit(formatted:string, digits:number):number {
        if(digits <= 0) return 0;
        let seen = 0;
        for(let index = 0; index < formatted.length; index++){
            if(/\d/.test(formatted[index])){
                seen++;
                if(seen === digits) return index + 1;
            }
        }
        return formatted.length;
    }

    async function reformat(){
        const raw:string   = element.value;
        const caret:number = element.selectionStart ?? raw.length;
        const before:number = countDigits(raw.slice(0, caret));

        const parsed:number|null = parseRibuan(raw);
        const formatted:string   = formatRibuan(parsed);

        value = parsed;
        text  = formatted;

        await tick();

        // Svelte may have skipped the DOM write when `formatted` matches the last
        // rendered text, so set it here rather than assume the binding did.
        element.value = formatted;
        const position:number = caretAfterDigit(formatted, before);
        element.setSelectionRange(position, position);
    }

    function onKeydown(event:KeyboardEvent){
        const isBackspace = event.key === 'Backspace';
        const isDelete    = event.key === 'Delete';
        if(!isBackspace && !isDelete) return;

        const start:number = element.selectionStart ?? 0;
        const end:number   = element.selectionEnd ?? 0;
        if(start !== end) return;                       // a selection deletes normally

        const raw:string = element.value;

        if(isBackspace){
            if(start === 0) return;
            if(/\d/.test(raw[start - 1])) return;       // deleting a digit: normal
            const cut:number = start - 2;               // the digit beyond the separator
            if(cut < 0) return;
            event.preventDefault();
            element.value = raw.slice(0, cut) + raw.slice(start - 1);
            element.setSelectionRange(cut, cut);
            reformat();
            return;
        }

        if(start >= raw.length) return;
        if(/\d/.test(raw[start])) return;
        event.preventDefault();
        element.value = raw.slice(0, start) + raw.slice(start + 2);
        element.setSelectionRange(start, start);
        reformat();
    }
</script>

<input
    {id}
    bind:this={element}
    type="text"
    inputmode="numeric"
    autocomplete="off"
    value={text}
    {placeholder}
    {disabled}
    aria-label={ariaLabel || undefined}
    class={klass}
    on:input={reformat}
    on:keydown={onKeydown} />
