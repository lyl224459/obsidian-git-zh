<script lang="ts">
    import { setIcon, type EventRef } from "obsidian";
    import { SimpleGit } from "src/gitManager/simpleGit";
    import type ObsidianGit from "src/main";
    import type { LogEntry } from "src/types";
    import { onDestroy, onMount } from "svelte";
    import LogComponent from "./components/logComponent.svelte";
    import type HistoryView from "./historyView";

    interface Props {
        plugin: ObsidianGit;
        view: HistoryView;
    }

    let { plugin = $bindable(), view }: Props = $props();
    let loading: boolean = $state(false);
    let buttons: HTMLElement[] = $state([]);
    let logs: LogEntry[] | undefined = $state();
    let showTree: boolean = $state(plugin.settings.treeStructure);
    let refreshRef: EventRef;

    let layoutBtn: HTMLElement | undefined = $state();

    $effect(() => {
        if (layoutBtn) {
            layoutBtn.empty();
        }
    });

    refreshRef = view.app.workspace.on(
        "obsidian-git:head-change",
        () => void refresh().catch(console.error)
    );

    $effect(() => {
        buttons.forEach((btn) => setIcon(btn, btn.getAttr("data-icon")!));
    });

    onDestroy(() => {
        view.app.workspace.offref(refreshRef);
    });

    onMount(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !loading) {
                appendLogs().catch(console.error);
            }
        });
        const sentinel = document.querySelector("#sentinel");
        if (sentinel) {
            observer.observe(sentinel);
        }

        return () => {
            observer.disconnect();
        };
    });

    refresh().catch(console.error);

    function triggerRefresh() {
        refresh().catch(console.error);
    }

    async function refresh() {
        if (!plugin.gitReady) {
            logs = undefined;
            return;
        }
        loading = true;
        const isSimpleGit = plugin.gitManager instanceof SimpleGit;
        let limit;
        if ((logs?.length ?? 0) == 0) {
            limit = isSimpleGit ? 50 : 10;
        } else {
            limit = logs!.length;
        }
        logs = await plugin.gitManager.log(undefined, false, limit);
        loading = false;
    }

    async function appendLogs() {
        if (!plugin.gitReady || logs === undefined) {
            return;
        }
        loading = true;
        const isSimpleGit = plugin.gitManager instanceof SimpleGit;
        const limit = isSimpleGit ? 50 : 10;
        const newLogs = await plugin.gitManager.log(
            undefined,
            false,
            limit,
            logs.last()?.hash
        );
        // Remove the first element of the new logs, as it is the same as the last element of the current logs.
        // And don't use hash^ as it fails for the first commit.
        logs.push(...newLogs.slice(1));
        loading = false;
    }
</script>

<div class="git-view">
    <div class="nav-header">
        <div class="nav-buttons-container">
            <div
                id="layoutChange"
                class="clickable-icon nav-action-button"
                aria-label="Change Layout"
                data-icon={showTree ? "list-tree" : "folder-closed"}
                bind:this={buttons[0]}
                role="button"
                tabindex="0"
                onkeydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        showTree = !showTree;
                        setIcon(buttons[0], showTree ? "list-tree" : "folder-closed");
                        plugin.settings.treeStructure = showTree;
                        void plugin.saveSettings();
                    }
                }}
                onclick={() => {
                    showTree = !showTree;
                    setIcon(buttons[0], showTree ? "list-tree" : "folder-closed");
                    plugin.settings.treeStructure = showTree;
                    void plugin.saveSettings();
                }}
            ></div>
            <div
                id="refresh"
                class="clickable-icon nav-action-button"
                class:loading
                data-icon="refresh-cw"
                aria-label="Refresh"
                bind:this={buttons[1]}
                role="button"
                tabindex="0"
                onkeydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        triggerRefresh();
                    }
                }}
                onclick={triggerRefresh}
            ></div>
        </div>
    </div>

    {#if logs}
        <div class="nav-files-container">
            {#each logs as log, i}
                <LogComponent log={log} {view} plugin={plugin} />
            {/each}
            <div id="sentinel"></div>
        </div>
    {:else}
        <div class="obsidian-git-center">
            <h3>Loading history...</h3>
        </div>
    {/if}
</div>

<style>
    #sentinel {
        height: 20px;
    }
    
    .nav-header {
        padding: 8px;
        border-bottom: 1px solid var(--background-modifier-border);
    }
    
    .nav-buttons-container {
        display: flex;
        gap: 4px;
        justify-content: flex-end;
    }
    
    .git-view {
        display: flex;
        flex-direction: column;
        position: relative;
        height: 100%;
        background-color: var(--background-primary);
        min-width: 0;
        min-height: 0;
    }
    
    .nav-files-container {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
    }
</style>