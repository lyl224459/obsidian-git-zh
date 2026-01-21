<script lang="ts">
    import { Platform, Scope, setIcon } from "obsidian";
    import { SOURCE_CONTROL_VIEW_CONFIG } from "src/constants";
    import type ObsidianGit from "src/main";
    import type {
        FileStatusResult,
        Status,
        StatusRootTreeItem,
    } from "src/types";
    import { FileType } from "src/types";
    import { arrayProxyWithNewLength, getDisplayPath } from "src/utils";
    import { slide } from "svelte/transition";
    import FileComponent from "./components/fileComponent.svelte";
    import PulledFileComponent from "./components/pulledFileComponent.svelte";
    import StagedFileComponent from "./components/stagedFileComponent.svelte";
    import TreeComponent from "./components/treeComponent.svelte";
    import type GitView from "./sourceControl";
    import TooManyFilesComponent from "./components/tooManyFilesComponent.svelte";

    interface Props {
        plugin: ObsidianGit;
        view: GitView;
    }

    let { plugin, view }: Props = $props();
    let loading: boolean = $state(false);
    let status: Status | undefined = $state();
    let lastPulledFiles: FileStatusResult[] = $state([]);
    let commitMessage = $state(plugin.settings.commitMessage);
    let buttons: HTMLElement[] = $state([]);
    let changeHierarchy: StatusRootTreeItem | undefined = $state();
    let stagedHierarchy: StatusRootTreeItem | undefined = $state();
    let lastPulledFilesHierarchy: StatusRootTreeItem | undefined = $state();
    let changesOpen = $state(true);
    let stagedOpen = $state(true);
    let lastPulledFilesOpen = $state(true);
    let unPushedCommits = $state(0);
    let stagedClosed: Record<string, boolean> = $state({});
    let unstagedClosed: Record<string, boolean> = $state({});
    let pulledClosed: Record<string, boolean> = $state({});

    let showTree = $state(plugin.settings.treeStructure);
    view.registerEvent(
        view.app.workspace.on(
            "obsidian-git:loading-status",
            () => (loading = true)
        )
    );
    view.registerEvent(
        view.app.workspace.on(
            "obsidian-git:status-changed",
            () => void refresh().catch(console.error)
        )
    );
    if (view.plugin.cachedStatus == undefined) {
        view.plugin.refresh().catch(console.error);
    } else {
        refresh().catch(console.error);
    }
    $effect(() => {
        buttons.forEach((btn) => setIcon(btn, btn.getAttr("data-icon")!));
    });

    $effect(() => {
        // highlight push button if there are unpushed commits
        buttons.forEach((btn) => {
            // when reloading the view from settings change, the btn are null at first
            if (!btn || btn.id != "push") return;
            if (Platform.isMobile) {
                btn.removeClass("button-border");
                if (unPushedCommits > 0) {
                    btn.addClass("button-border");
                }
            } else {
                btn.firstElementChild?.removeAttribute("color");
                if (unPushedCommits > 0) {
                    btn.firstElementChild?.setAttr(
                        "color",
                        "var(--text-accent)"
                    );
                }
            }
        });
    });

    view.scope = new Scope(plugin.app.scope);
    view.scope.register(["Ctrl"], "Enter", (_: KeyboardEvent) =>
        commitAndSync()
    );

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
            // If staged files exist only commit them, but if not, commit all.
            // I hope this is the most intuitive way.
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

    async function refresh(): Promise<void> {
        if (!plugin.gitReady) {
            status = undefined;
            return;
        }
        unPushedCommits = await plugin.gitManager.getUnpushedCommits();

        status = plugin.cachedStatus;
        loading = false;
        if (
            plugin.lastPulledFiles &&
            plugin.lastPulledFiles != lastPulledFiles
        ) {
            lastPulledFiles = plugin.lastPulledFiles;

            lastPulledFilesHierarchy = {
                title: "",
                path: "",
                vaultPath: "",
                children: plugin.gitManager.getTreeStructure(lastPulledFiles),
            };
        }
        if (status) {
            const sort = (a: FileStatusResult, b: FileStatusResult) => {
                return a.vaultPath
                    .split("/")
                    .last()!
                    .localeCompare(getDisplayPath(b.vaultPath));
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

    function push() {
        loading = true;
        plugin.promiseQueue.addTask(() =>
            plugin.push().finally(triggerRefresh)
        );
    }
    function pull() {
        loading = true;
        plugin.promiseQueue.addTask(() =>
            plugin.pullChangesFromRemote().finally(triggerRefresh)
        );
    }
    function discard(event: Event) {
        event.stopPropagation();
        void plugin.discardAll();
    }

    let rows = $derived((commitMessage.match(/\n/g) || []).length + 1 || 1);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<main data-type={SOURCE_CONTROL_VIEW_CONFIG.type} class="git-view">
    <div class="nav-header">
        <div class="nav-buttons-container">
            <div
                id="backup-btn"
                data-icon="upload-cloud"
                class="clickable-icon nav-action-button"
                aria-label="Commit and sync"
                bind:this={buttons[0]}
                onclick={commitAndSync}
            ></div>
            <div
                id="commit-btn"
                data-icon="check-circle-2"
                class="clickable-icon nav-action-button"
                aria-label="Commit"
                bind:this={buttons[1]}
                onclick={commit}
            ></div>
            <div
                id="stage-all"
                class="clickable-icon nav-action-button"
                data-icon="package-check"
                aria-label="Stage all"
                bind:this={buttons[2]}
                onclick={stageAll}
            ></div>
            <div
                id="unstage-all"
                class="clickable-icon nav-action-button"
                data-icon="package-x"
                aria-label="Unstage all"
                bind:this={buttons[3]}
                onclick={unstageAll}
            ></div>
            <div
                id="push"
                class="clickable-icon nav-action-button"
                data-icon="corner-up-right"
                aria-label="Push"
                bind:this={buttons[4]}
                onclick={push}
            ></div>
            <div
                id="pull"
                class="clickable-icon nav-action-button"
                data-icon="corner-down-left"
                aria-label="Pull"
                bind:this={buttons[5]}
                onclick={pull}
            ></div>
            <div
                id="layoutChange"
                class="clickable-icon nav-action-button"
                aria-label="Change Layout"
                data-icon={showTree ? "list-tree" : "folder-closed"}
                bind:this={buttons[6]}
                onclick={() => {
                    showTree = !showTree;
                    setIcon(buttons[6], showTree ? "list-tree" : "folder-closed");
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
                bind:this={buttons[7]}
                onclick={triggerRefresh}
            ></div>
        </div>
    </div>
    <div class="git-commit-msg">
        <textarea
            {rows}
            class="commit-msg-input"
            spellcheck="true"
            placeholder="Enter commit message..."
            bind:value={commitMessage}
            onkeydown={(e) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    commitMessage = plugin.settings.commitMessage;
                }
            }}
        ></textarea>
        {#if commitMessage}
            <div
                class="git-commit-msg-clear-button"
                onclick={() => (commitMessage = "")}
                aria-label="Clear"
            ></div>
        {/if}
    </div>

    <div class="nav-files-container" style="position: relative;">
        {#if status && stagedHierarchy && changeHierarchy}
            <div class="tree-item nav-folder mod-root">
                <div
                    class="staged tree-item nav-folder"
                    class:is-collapsed={!stagedOpen}
                >
                    <div
                        class="tree-item-self is-clickable nav-folder-title"
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
                                ><path d="M3 8L12 17L21 8" /></svg
                            >
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
                                <path d="m16 16 2.5-2.5"/><path d="M10.5 5H18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1H7"/><path d="M8 16h.01"/><path d="M12 16h.01"/><path d="M16 16h.01"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/><path d="M8 8h.01"/><path d="M12 8h.01"/><path d="M16 8h.01"/></svg>
                            Staged Changes
                        </div>

                        <div class="git-tools">
                            <div class="buttons">
                                <div
                                    data-icon="package-x"
                                    aria-label="Unstage all"
                                    bind:this={buttons[8]}
                                    onclick={unstageAll}
                                    class="clickable-icon"
                                ></div>
                            </div>
                            <div class="files-count">
                                {status.staged.length}
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
                        onclick={() => (changesOpen = !changesOpen)}
                        class="tree-item-self is-clickable nav-folder-title"
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
                                ><path d="M3 8L12 17L21 8" /></svg
                            >
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
                                <path d="M4 13.5V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2h-5.5"/><polyline points="14 2 14 8 20 8"/><path d="M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z"/></svg>
                            Unstaged Changes
                        </div>
                        <div class="git-tools">
                            <div class="buttons">
                                <div
                                    data-icon="trash"
                                    aria-label="Discard all"
                                    onclick={discard}
                                    class="clickable-icon"
                                ></div>
                                <div
                                    data-icon="package-plus"
                                    aria-label="Stage all"
                                    bind:this={buttons[9]}
                                    onclick={stageAll}
                                    class="clickable-icon"
                                ></div>
                            </div>
                            <div class="files-count">
                                {status.changed.length}
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
                {#if lastPulledFiles.length > 0 && lastPulledFilesHierarchy}
                    <div
                        class="pulled nav-folder"
                        class:is-collapsed={!lastPulledFilesOpen}
                    >
                        <div
                            class="tree-item-self is-clickable nav-folder-title"
                            onclick={() =>
                                (lastPulledFilesOpen = !lastPulledFilesOpen)}
                        >
                            <div
                                class="tree-item-icon nav-folder-collapse-indicator collapse-icon"
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
                                    ><path d="M3 8L12 17L21 8" /></svg
                                >
                            </div>

                            <div
                                class="tree-item-inner nav-folder-title-content"
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
                                    class="svg-icon lucide-download"
                                    style="margin-right: 6px;"
                                >
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                                Recently Pulled Files
                            </div>

                            <span class="tree-item-flair"
                                >{lastPulledFiles.length}</span
                            >
                        </div>
                        {#if lastPulledFilesOpen}
                            <div
                                class="tree-item-children nav-folder-children"
                                transition:slide|local={{ duration: 150 }}
                            >
                                {#if showTree}
                                    <TreeComponent
                                        hierarchy={lastPulledFilesHierarchy}
                                        {plugin}
                                        {view}
                                        fileType={FileType.pulled}
                                        topLevel={true}
                                        bind:closed={pulledClosed}
                                    />
                                {:else}
                                    {#each lastPulledFiles as change}
                                        <PulledFileComponent {change} {view} />
                                    {/each}
                                    <TooManyFilesComponent
                                        files={lastPulledFiles}
                                    />
                                {/if}
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</main>

<style lang="scss">
    .commit-msg-input {
        width: 100%;
        overflow: hidden;
        resize: none;
        padding: 8px 30px 8px 8px;
        background-color: transparent;
        border: none;
        font-size: var(--font-ui-small);
        min-height: 40px;
        outline: none;
        font-family: var(--font-interface);
        color: var(--text-normal);
    }

    .git-commit-msg {
        position: relative;
        padding: 0;
        width: calc(100% - var(--size-4-8));
        margin: 8px 4px;
    }
    main {
        .git-tools {
            .files-count {
                padding-left: var(--size-2-1);
                width: 11px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
    }

    .nav-folder-title {
        align-items: center;
    }

    .git-commit-msg-clear-button {
        position: absolute;
        background: transparent;
        border-radius: 50%;
        color: var(--search-clear-button-color);
        cursor: var(--cursor);
        top: 6px;
        right: 6px;
        bottom: 0px;
        line-height: 0;
        height: 24px;
        width: 24px;
        margin: auto;
        padding: 0 0;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: color 0.15s ease-in-out;
        
        &:hover {
            background-color: var(--background-modifier-hover);
        }
    }

    .git-commit-msg-clear-button:after {
        content: "";
        height: var(--search-clear-button-size);
        width: var(--search-clear-button-size);
        display: block;
        background-color: currentColor;
        mask-image: url("data:image/svg+xml,<svg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12ZM3.8705 3.09766L6.00003 5.22718L8.12955 3.09766L8.9024 3.8705L6.77287 6.00003L8.9024 8.12955L8.12955 8.9024L6.00003 6.77287L3.8705 8.9024L3.09766 8.12955L5.22718 6.00003L3.09766 3.8705L3.8705 3.09766Z' fill='currentColor'/></svg>");
        mask-repeat: no-repeat;
        -webkit-mask-image: url("data:image/svg+xml,<svg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12ZM3.8705 3.09766L6.00003 5.22718L8.12955 3.09766L8.9024 3.8705L6.77287 6.00003L8.9024 8.12955L8.12955 8.9024L6.00003 6.77287L3.8705 8.9024L3.09766 8.12955L5.22718 6.00003L3.09766 3.8705L3.8705 3.09766Z' fill='currentColor'/></svg>");
        -webkit-mask-repeat: no-repeat;
    }
</style>