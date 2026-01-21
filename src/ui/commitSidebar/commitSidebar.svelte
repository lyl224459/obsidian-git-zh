<script lang="ts">
    import { setIcon } from "obsidian";
    import { t } from "src/i18n";
    import type ObsidianGit from "src/main";
    import type GitCommitSidebarView from "./commitSidebar";
    import { FileType } from "src/types";
    import { arrayProxyWithNewLength } from "src/utils";
    import { slide } from "svelte/transition";
    import FileComponent from "../sourceControl/components/fileComponent.svelte";
    import StagedFileComponent from "../sourceControl/components/stagedFileComponent.svelte";
    import TreeComponent from "../sourceControl/components/treeComponent.svelte";
    import TooManyFilesComponent from "../sourceControl/components/tooManyFilesComponent.svelte";
    import type { FileStatusResult, Status, StatusRootTreeItem } from "src/types";

    interface Props {
        plugin: ObsidianGit;
        view: GitCommitSidebarView;
    }

    let { plugin, view }: Props = $props();
    let loading: boolean = $state(false);
    let status: Status | undefined = $state();
    let commitMessage = $state(plugin.settings.commitMessage);
    let buttons: HTMLElement[] = $state([]);
    let changeHierarchy: StatusRootTreeItem | undefined = $state();
    let stagedHierarchy: StatusRootTreeItem | undefined = $state();
    let changesOpen = $state(true);
    let stagedOpen = $state(true);
    let stagedClosed: Record<string, boolean> = $state({});
    let unstagedClosed: Record<string, boolean> = $state({});
    let showTree = $state(plugin.settings.treeStructure);

    // Initialize the view
    if (view.plugin.cachedStatus == undefined) {
        view.plugin.refresh().catch(console.error);
    } else {
        refresh().catch(console.error);
    }

    $effect(() => {
        buttons.forEach((btn) => setIcon(btn, btn.getAttr("data-icon")!));
    });

    async function refresh(): Promise<void> {
        if (!plugin.gitReady) {
            status = undefined;
            return;
        }
        status = plugin.cachedStatus;
        loading = false;
        
        if (status) {
            const sort = (a: FileStatusResult, b: FileStatusResult) => {
                return a.vaultPath
                    .split("/")
                    .last()!
                    .localeCompare(a.vaultPath.split("/").last()!);
            };
            status.changed.sort(sort);
            status.staged.sort(sort);
            changeHierarchy = {
                title: "",
                path: "",
                vaultPath: "",
                children: plugin.gitManager.getTreeStructure(status.changed),
            };
            stagedHierarchy = {
                title: "",
                path: "",
                vaultPath: "",
                children: plugin.gitManager.getTreeStructure(status.staged),
            };
        } else {
            changeHierarchy = undefined;
            stagedHierarchy = undefined;
        }
    }

    function triggerRefresh() {
        view.app.workspace.trigger("obsidian-git:refresh");
    }

    function commit() {
        loading = true;
        if (status) {
            const onlyStaged = status.staged.length > 0;
            plugin.promiseQueue.addTask(() =>
                plugin
                    .commit({ fromAuto: false, commitMessage, onlyStaged })
                    .then(() => (commitMessage = plugin.settings.commitMessage))
                    .finally(triggerRefresh)
            );
        }
    }

    function commitAndSync() {
        loading = true;
        if (status) {
            const onlyStaged = status.staged.length > 0;
            plugin.promiseQueue.addTask(() =>
                plugin
                    .commitAndSync({
                        fromAutoBackup: false,
                        commitMessage,
                        onlyStaged,
                    })
                    .then(() => {
                        commitMessage = plugin.settings.commitMessage;
                    })
                    .finally(triggerRefresh)
            );
        }
    }

    function stageAll(event: MouseEvent) {
        event.stopPropagation();
        loading = true;
        plugin.promiseQueue.addTask(() =>
            plugin.gitManager
                .stageAll({ status: status })
                .finally(triggerRefresh)
        );
    }

    function unstageAll(event: MouseEvent) {
        event.stopPropagation();
        loading = true;
        plugin.promiseQueue.addTask(() =>
            plugin.gitManager
                .unstageAll({ status: status })
                .finally(triggerRefresh)
        );
    }

    let rows = $derived((commitMessage.match(/\n/g) || []).length + 1 || 1);
</script>

<div class="git-commit-sidebar">
    <div class="sidebar-header">
        <h3>{t("views.commit.title")}</h3>
        <div class="nav-buttons-container">
            <div
                class="clickable-icon nav-action-button"
                data-icon="refresh-cw"
                aria-label={t("misc.refresh")}
                bind:this={buttons[0]}
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
            <div
                class="clickable-icon nav-action-button"
                data-icon={showTree ? "list" : "folder-closed"}
                aria-label={t("misc.toggle-tree-list-view")}
                bind:this={buttons[1]}
                role="button"
                tabindex="0"
                onkeydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        showTree = !showTree;
                        setIcon(buttons[1], showTree ? "list" : "folder-closed");
                        plugin.settings.treeStructure = showTree;
                        void plugin.saveSettings();
                    }
                }}
                onclick={() => {
                    showTree = !showTree;
                    setIcon(buttons[1], showTree ? "list" : "folder-closed");
                    plugin.settings.treeStructure = showTree;
                    void plugin.saveSettings();
                }}
            ></div>
        </div>
    </div>

    <div class="commit-section">
        <div class="git-commit-msg">
            <textarea
                {rows}
                class="commit-msg-input"
                spellcheck="true"
                placeholder={t("views.commit.placeholder")}
                bind:value={commitMessage}
                onkeydown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        commitAndSync();
                    }
                }}
            ></textarea>
            {#if commitMessage}
                <div
                    class="git-commit-msg-clear-button"
                    onclick={() => (commitMessage = "")}
                    onkeydown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            commitMessage = "";
                        }
                    }}
                    aria-label={t("misc.clear")}
                    role="button"
                    tabindex="0"
                ></div>
            {/if}
        </div>

        <div class="commit-actions">
            <button
                class="mod-cta"
                onclick={commit}
                disabled={!status || (status.changed.length === 0 && status.staged.length === 0)}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="svg-icon lucide-check"
                    style="margin-right: 6px;"
                >
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {t("commands.commit")}
            </button>
            <button
                class="mod-cta"
                onclick={commitAndSync}
                disabled={!status || (status.changed.length === 0 && status.staged.length === 0)}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="svg-icon lucide-upload"
                    style="margin-right: 6px;"
                >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" x2="12" y1="3" y2="15"></line>
                </svg>
                {t("commands.commit-and-sync")}
            </button>
        </div>
    </div>

    <div class="files-section">
        {#if status && stagedHierarchy && changeHierarchy}
            <div class="tree-item nav-folder mod-root">
                <div
                    class="staged tree-item nav-folder"
                    class:is-collapsed={!stagedOpen}
                >
                    <div
                        class="tree-item-self is-clickable nav-folder-title"
                        role="button"
                        tabindex="0"
                        onkeydown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                stagedOpen = !stagedOpen;
                            }
                        }}
                        onclick={() => (stagedOpen = !stagedOpen)}
                    >
                        <div
                            class="tree-item-icon nav-folder-collapse-indicator collapse-icon"
                            class:is-collapsed={!stagedOpen}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="svg-icon right-triangle"
                            >
                                <path d="M3 8L12 17L21 8" />
                            </svg>
                        </div>
                        <div class="tree-item-inner nav-folder-title-content">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="svg-icon lucide-package-check"
                                style="margin-right: 6px;"
                            >
                                <path d="m16 16 2.5-2.5" />
                                <path d="M10.5 5H18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1H7" />
                                <path d="M8 16h.01" />
                                <path d="M12 16h.01" />
                                <path d="M16 16h.01" />
                                <path d="M8 12h.01" />
                                <path d="M12 12h.01" />
                                <path d="M16 12h.01" />
                                <path d="M8 8h.01" />
                                <path d="M12 8h.01" />
                                <path d="M16 8h.01" />
                            </svg>
                            {t("views.commit.staged")} ({status.staged.length})
                        </div>
                        <div class="git-tools">
                            <div class="buttons">
                                <div
                                    data-icon="package-x"
                                    aria-label={t("views.commit.unstage-all")}
                                    bind:this={buttons[2]}
                                    role="button"
                                    tabindex="0"
                                    onkeydown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            unstageAll();
                                        }
                                    }}
                                    onclick={unstageAll}
                                    class="clickable-icon"
                                ></div>
                            </div>
                        </div>
                    </div>
                    {#if stagedOpen}
                        <div
                            class="tree-item-children nav-folder-children"
                            transition:slide|local={{ duration: 150 }}
                        >
                            {#if showTree}
                                <TreeComponent
                                    hierarchy={stagedHierarchy}
                                    {plugin}
                                    {view}
                                    fileType={FileType.staged}
                                    topLevel={true}
                                    bind:closed={stagedClosed}
                                />
                            {:else}
                                {#each arrayProxyWithNewLength(status.staged, 500) as stagedFile}
                                    <StagedFileComponent
                                        change={stagedFile}
                                        {view}
                                        manager={plugin.gitManager}
                                    />
                                {/each}
                                <TooManyFilesComponent files={status.staged} />
                            {/if}
                        </div>
                    {/if}
                </div>

                <div
                    class="changes tree-item nav-folder"
                    class:is-collapsed={!changesOpen}
                >
                    <div
                        class="tree-item-self is-clickable nav-folder-title"
                        role="button"
                        tabindex="0"
                        onkeydown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                changesOpen = !changesOpen;
                            }
                        }}
                        onclick={() => (changesOpen = !changesOpen)}
                    >
                        <div
                            class="tree-item-icon nav-folder-collapse-indicator collapse-icon"
                            class:is-collapsed={!changesOpen}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="svg-icon right-triangle"
                            >
                                <path d="M3 8L12 17L21 8" />
                            </svg>
                        </div>
                        <div class="tree-item-inner nav-folder-title-content">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="svg-icon lucide-file-edit"
                                style="margin-right: 6px;"
                            >
                                <path d="M4 13.5V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2h-5.5" />
                                <polyline points="14 2 14 8 20 8" />
                                <path d="M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z" />
                            </svg>
                            {t("views.commit.unstaged")} ({status.changed.length})
                        </div>
                        <div class="git-tools">
                            <div class="buttons">
                                <div
                                    data-icon="package-plus"
                                    aria-label={t("views.commit.stage-all")}
                                    bind:this={buttons[3]}
                                    role="button"
                                    tabindex="0"
                                    onkeydown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            stageAll(e);
                                        }
                                    }}
                                    onclick={stageAll}
                                    class="clickable-icon"
                                ></div>
                            </div>
                        </div>
                    </div>
                    {#if changesOpen}
                        <div
                            class="tree-item-children nav-folder-children"
                            transition:slide|local={{ duration: 150 }}
                        >
                            {#if showTree}
                                <TreeComponent
                                    hierarchy={changeHierarchy}
                                    {plugin}
                                    {view}
                                    fileType={FileType.changed}
                                    topLevel={true}
                                    bind:closed={unstagedClosed}
                                />
                            {:else}
                                {#each arrayProxyWithNewLength(status.changed, 500) as change}
                                    <FileComponent
                                        {change}
                                        {view}
                                        manager={plugin.gitManager}
                                    />
                                {/each}
                                <TooManyFilesComponent files={status.changed} />
                            {/if}
                        </div>
                    {/if}
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    .git-commit-sidebar {
        padding: 12px;
        height: 100%;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
    }

    .sidebar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--background-modifier-border);
    }

    .sidebar-header h3 {
        margin: 0;
        font-size: 1.2em;
        color: var(--text-normal);
    }

    .nav-buttons-container {
        display: flex;
        gap: 6px;
    }

    .commit-section {
        margin-bottom: 16px;
    }

    .git-commit-msg {
        position: relative;
        margin-bottom: 12px;
    }

    .commit-msg-input {
        width: 100%;
        padding: 8px 30px 8px 8px;
        background-color: var(--background-primary-alt);
        border: 1px solid var(--background-modifier-border);
        border-radius: 4px;
        font-size: var(--font-ui-small);
        min-height: 60px;
        resize: vertical;
        font-family: var(--font-interface);
        color: var(--text-normal);
    }

    .git-commit-msg-clear-button {
        position: absolute;
        background: transparent;
        border-radius: 50%;
        color: var(--search-clear-button-color);
        cursor: var(--cursor);
        top: 8px;
        right: 8px;
        height: 24px;
        width: 24px;
        margin: auto;
        padding: 0 0;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: color 0.15s ease-in-out;
    }

    .git-commit-msg-clear-button:hover {
        background-color: var(--background-modifier-hover);
    }

    .commit-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 16px;
    }

    .commit-actions button {
        flex: 1;
        min-width: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6px 10px;
        border-radius: 4px;
        font-size: var(--font-ui-small);
    }

    /* 响应式调整：在较小屏幕上调整按钮 */
    @media (max-width: 480px) {
        .commit-actions {
            flex-direction: column;
        }

        .commit-actions button {
            min-width: auto;
            width: 100%;
        }

        .sidebar-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
        }

        .nav-buttons-container {
            align-self: flex-end;
        }
    }

    .files-section {
        flex: 1;
        overflow-y: auto;
    }

    .tree-item.nav-folder {
        margin: 6px 0;
    }

    .tree-item.nav-folder .tree-item-self {
        padding: 6px 8px;
        border-radius: 4px;
    }

    .tree-item.nav-folder .tree-item-children {
        padding: 0 0 0 16px;
    }

    .git-tools .buttons {
        display: flex;
        gap: 4px;
    }

    .nav-action-button {
        padding: 4px;
        border-radius: 4px;
        transition: all 0.15s ease;
    }

    .nav-action-button:hover {
        background-color: var(--background-modifier-hover);
        color: var(--text-normal);
    }
</style>