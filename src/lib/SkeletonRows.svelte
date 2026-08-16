<script lang="ts">
    /*
    | Placeholder rows shown while a table loads.
    |
    | Replaces a single "Memuat data.." cell. The point is that the table keeps its
    | shape: the layout does not collapse and then jump back when the rows arrive,
    | which is what made loading feel worse than it actually was.
    */
    export let rows:number = 5;
    export let columns:number = 6;
</script>

{#each Array(rows) as _, r}
    <tr aria-hidden="true">
        {#each Array(columns) as _, c}
            <td class="py-3">
                <!-- Varying widths so it reads as content rather than a progress bar. -->
                <div class="skeleton h-3 rounded"
                     style="width: {c === 0 ? 30 : 55 + ((r + c) % 4) * 12}%"></div>
            </td>
        {/each}
    </tr>
{/each}
