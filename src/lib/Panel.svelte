<script lang="ts">
    /*
    | A flat surface for content.
    |
    | Replaces `card bg-base-100 shadow-xl`. A heavy drop shadow on a full-width
    | container is what dates the old look — at this size the shadow reads as a
    | smudge rather than elevation. A hairline border does the same separating job
    | and stays crisp in both themes.
    |
    | `flush` drops the padding for panels whose only child is a table, which
    | should meet the panel edge rather than float inside it.
    */
    export let flush:boolean = false;
    let klass = '';
    export { klass as class };
</script>

<section class="bg-base-100 border border-base-300 rounded-xl overflow-hidden {klass}">
    <div class={flush ? '' : 'p-4 lg:p-5'}>
        <slot />
    </div>
</section>
