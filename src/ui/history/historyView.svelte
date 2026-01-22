<script lang="ts">
    import { setIcon, type EventRef, Platform } from "obsidian";
    import { SimpleGit } from "src/gitManager/simpleGit";
    import type ObsidianGit from "src/main";
    import type { LogEntry, ObsidianGitPlugin } from "src/types";
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

    // 获取设备类型和响应式变量
    let deviceType = $derived((plugin as ObsidianGitPlugin).deviceType);
    let isMobile = $derived(deviceType === 'mobile');
    let isTablet = $derived(deviceType === 'tablet');
    let isSmallScreen = $derived(isMobile || (isTablet && window.innerWidth < 768));

    // 响应式布局变量
    let _buttonSize = $derived(isSmallScreen ? 'compact' : 'normal');
    let showButtonLabels = $derived(isSmallScreen);

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
        const deviceType = (plugin as ObsidianGitPlugin).deviceType;
        let limit;
        if ((logs?.length ?? 0) == 0) {
            // 根据设备类型优化初始加载量
            if (deviceType === 'tablet') {
                // 平板设备可以加载更多数据
                limit = isSimpleGit ? 40 : 15;
            } else if (deviceType === 'mobile') {
                // 手机设备减少加载量
                limit = isSimpleGit ? 20 : 5;
            } else {
                // 桌面设备
                limit = isSimpleGit ? 50 : 10;
            }
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
        const isMobile = Platform.isMobileApp;
        const limit = isSimpleGit ? (isMobile ? 15 : 50) : (isMobile ? 5 : 10);
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
        <div class="nav-buttons-container history-toolbar {isSmallScreen ? 'history-toolbar-compact' : isTablet ? 'history-toolbar-tablet' : ''}">
            <div
                id="layoutChange"
                class="clickable-icon nav-action-button history-button"
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
            >
                {#if showButtonLabels}<span>布局</span>{/if}
            </div>
            <div
                id="refresh"
                class="clickable-icon nav-action-button history-button"
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
            >
                {#if showButtonLabels}<span>刷新</span>{/if}
            </div>
        </div>
    </div>

    {#if logs}
        <div class="nav-files-container">
            {#each logs as log}
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

    /* 响应式按钮布局 */
    .history-toolbar-compact {
        flex-direction: column;
        gap: 6px;
        align-items: stretch;
    }

    .history-toolbar-tablet {
        gap: 6px;
    }

    .history-toolbar-compact .nav-action-button,
    .history-toolbar-tablet .nav-action-button {
        min-height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
    }

    /* 移动端优化 */
    @media (max-width: 768px) {
        .nav-header {
            padding: 6px;
        }

        .nav-buttons-container {
            gap: 4px;
        }

        .nav-action-button {
            min-height: 44px; /* 更好的触摸目标 */
            padding: 8px;
        }
    }

    /* 平板优化 */
    @media (min-width: 769px) and (max-width: 1024px) {
        .nav-header {
            padding: 8px;
        }

        .nav-action-button {
            min-height: 40px;
            padding: 6px;
        }
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