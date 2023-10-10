<script lang="ts">
    import toast, { Toaster } from 'svelte-french-toast';
    import { baseConfiguration } from "$lib/baseConfig";

    let email:string;
    let password:string;

    async function doPost(){
        const doPost = await fetch(baseConfiguration.defaultURL + 'Log-In',{
            method : 'POST',
            headers : { 'Content-Type' : 'application/json' },
            credentials : 'include',
            body : JSON.stringify({
                EMAIL : email,
                PASSWORD : password
            })
        });
        const doResponse = await doPost.json();
        return doResponse.status == 'success' ? toast.success(doResponse.message, { position: 'top-right' }) : toast.error(doResponse.message, { position : 'top-right' });
    }
</script>
<Toaster/>
<div class="bg-no-repeat bg-cover bg-center relative" style="background-image: url('/loginScreen.jpg');">
    <div class="absolute bg-gradient-to-b from-green-500 to-green-400 opacity-75 inset-0 z-0" />
    <div class="min-h-screen sm:flex sm:flex-row mx-0 justify-center">
        <div class="flex-col flex self-center p-10 sm:max-w-5xl xl:max-w-2xl z-10" >
            <div class="self-start hidden lg:flex flex-col text-white">
                <h1 class="mb-3 font-bold text-5xl">Selamat Datang!</h1>
                <p class="pr-3">
                    SIK adalah Sistem Internal Kosada adalah kerangka kerja
                    internal agar manajemen sistem dapat berjalan dengan baik.
                </p>
            </div>
        </div>
        <div class="flex justify-center self-center z-10">
            <div class="p-12 bg-white mx-auto rounded-2xl w-100">
                <div class="mb-4">
                    <h3 class="font-semibold text-2xl text-gray-800">
                        Sign In
                    </h3>
                    <p class="text-gray-500">Please sign in to your account.</p>
                </div>
                <div class="space-y-5">
                    <div class="space-y-2">
                        <label for="inputEmail" class="text-sm font-medium text-gray-700 tracking-wide" >Email</label >
                        <input class=" w-full text-base px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-400" type="" placeholder="mail@gmail.com" />
                    </div>
                    <div class="space-y-2">
                        <label for="inputPassword" class="mb-5 text-sm font-medium text-gray-700 tracking-wide" >Password</label>
                        <input class="w-full content-center text-base px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-400" type="" placeholder="Enter your password"/>
                    </div>
                    <div>
                        <button type="submit" class="w-full flex justify-center bg-green-400 hover:bg-green-500 text-gray-100 p-3 rounded-full tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-500" >Sign in</button>
                    </div>
                </div>
                <div class="pt-5 text-center text-gray-400 text-xs">
                    <span>
                        Copyright Kosada © { new Date().getFullYear() }<br/>
                        <a href="https://wa.me/628984170335" rel="" target="_blank" title="WhatsApp Odi" class="text-green hover:text-green-500">Created with 💖 by Odi</a>
                    </span>
                </div>
            </div>
        </div>
    </div>
</div>
