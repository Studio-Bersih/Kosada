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

<!--
  | Panels rise in slightly after the page header, so the page assembles
  | top-down rather than everything appearing at once. 60ms is below the ~100ms
  | threshold where a delay stops feeling like sequence and starts feeling like
  | waiting.
-->
<section
    class="bg-base-100 border border-base-300 rounded-xl overflow-hidden {klass}"
    style="animation: kosada-rise var(--dur-base) var(--ease-out) 60ms backwards;">
    <div class={flush ? '' : 'p-4 lg:p-5'}>
        <slot />
    </div>
</section>
