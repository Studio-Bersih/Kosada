/*
| The app's toast API.
|
| svelte-french-toast has no Svelte 5 release — its peer range is
| "^3.57.0 || ^4.0.0" and the only Svelte 5 build is 2.0.0-alpha.0, which is not
| something to depend on in a live lending system. It is replaced by
| svelte-sonner.
|
| The 49 call sites across 10 files keep the exact shape they already used:
|
|     toast.success(message, { position: 'top-right' })
|     toast.error(message, { position: 'top-right' })
|     toast.promise(promise, { loading, success, error }, { position })
|
| so the swap costs each page one import line. Position is accepted and ignored
| because svelte-sonner sets placement once on the <Toaster/> component rather
| than per toast — keeping the argument means no call site had to change, and a
| future library swap stays a one-file job.
*/
import { toast as sonner } from 'svelte-sonner';

type ToastOptions = {
    position? : string;
    duration? : number;
};

type PromiseMessages = {
    loading : string;
    success : string;
    error   : string;
};

function success(message:string, options:ToastOptions = {}):void {
    sonner.success(message, { duration : options.duration });
}

function error(message:string, options:ToastOptions = {}):void {
    sonner.error(message, { duration : options.duration });
}

/*
| Mirrors svelte-french-toast's promise(): shows `loading` while the promise is
| pending, then `success` or `error`. Returns the original promise so callers can
| still await or chain it.
*/
function promise<T>(subject:Promise<T>, messages:PromiseMessages, _options:ToastOptions = {}):Promise<T> {
    sonner.promise(subject, {
        loading : messages.loading,
        success : () => messages.success,
        error   : () => messages.error
    });
    return subject;
}

export const toast = { success, error, promise };
export default toast;
