<script lang="ts">
    import { setIcon, Platform } from "obsidian";
    import { t } from "src/i18n";
    import type ObsidianGit from "src/main";
    import type GitCommitSidebarView from "./commitSidebar";
    import { FileType, ObsidianGitPlugin } from "src/types";
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

    // 获取设备类型和响应式变量
    let deviceType = $derived((plugin as ObsidianGitPlugin).deviceType);
    let isMobile = $derived(deviceType === 'mobile');
    let isTablet = $derived(deviceType === 'tablet');
    let isSmallScreen = $derived(isMobile || (isTablet && window.innerWidth < 768));
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
    let amendCommit = $state(false);
    let showCommitTemplates = $state(false);
    let currentBranch = $state<string>("");
    let unPushedCommits = $state(0);
    
    // 常用提交模板
    const commitTemplates = [
        { label: "feat", template: "feat: " },
        { label: "fix", template: "fix: " },
        { label: "docs", template: "docs: " },
        { label: "style", template: "style: " },
        { label: "refactor", template: "refactor: " },
        { label: "test", template: "test: " },
        { label: "chore", template: "chore: " },
    ];

    // 获取分支信息
    async function updateBranchInfo() {
        if (!plugin.gitReady || !plugin.gitManager) {
            currentBranch = "";
            unPushedCommits = 0;
            return;
        }

        try {
            const branchInfo = await plugin.gitManager.branchInfo();
            currentBranch = branchInfo.current || "";
            const canPush = await plugin.gitManager.canPush();
            unPushedCommits = canPush ? 1 : 0;
        } catch (e) {
            console.error("Failed to get branch info:", e);
            currentBranch = "";
            unPushedCommits = 0;
        }
    }
    
    // Initialize the view
    if (view.plugin.cachedStatus == undefined) {
        view.plugin.refresh().catch(console.error);
    } else {
        refresh().catch(console.error);
    }
    
    // 初始化时获取分支信息
    updateBranchInfo().catch(console.error);

    $effect(() => {
        buttons.forEach((btn) => setIcon(btn, btn.getAttr("data-icon")!));
    });
    
    $effect(() => {
        // Highlight push button if there are unpushed commits
        buttons.forEach((btn) => {
            if (!btn || btn.id != "push-btn") return;
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

    async function refresh(): Promise<void> {
        if (!plugin.gitReady) {
            status = undefined;
            return;
        }
        status = plugin.cachedStatus;
        loading = false;
        
        if (status) {
            const sort = (a: FileStatusResult, b: FileStatusResult) => {
                const aFileName = a.vaultPath.split("/").last()!;
                const bFileName = b.vaultPath.split("/").last()!;
                return aFileName.localeCompare(bFileName);
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
        
        await updateBranchInfo();
    }

    function triggerRefresh() {
        view.app.workspace.trigger("obsidian-git:refresh");
        updateBranchInfo().catch(console.error);
    }

    function commit() {
        loading = true;
        if (status) {
            const onlyStaged = status.staged.length > 0;
            plugin.promiseQueue.addTask(() =>
                plugin
                    .commit({ 
                        fromAuto: false, 
                        commitMessage, 
                        onlyStaged,
                        amend: amendCommit 
                    })
                    .then(() => {
                        commitMessage = plugin.settings.commitMessage;
                        amendCommit = false;
                    })
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
                        amendCommit = false;
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
    
    function pull() {
        loading = true;
        plugin.promiseQueue.addTask(() =>
            plugin.pull().finally(triggerRefresh)
        );
    }
    
    function push() {
        loading = true;
        plugin.promiseQueue.addTask(() =>
            plugin.push().finally(triggerRefresh)
        );
    }
    
    function discardAll() {
        loading = true;
        plugin.promiseQueue.addTask(() =>
            plugin.discardAll().finally(triggerRefresh)
        );
    }
    
    function useTemplate(template: string) {
        commitMessage = template;
        showCommitTemplates = false;
    }

    let rows = $derived((commitMessage.match(/\n/g) || []).length + 1 || 1);
</script>

<div class="git-commit-sidebar">
    <div class="sidebar-header">
        <div class="header-left">
            <h3>{t("views.commit.title")}</h3>
            {#if currentBranch}
                <div class="branch-info">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="svg-icon"
                        style="margin-right: 4px;"
                    >
                        <line x1="6" x2="6" y1="3" y2="15"></line>
                        <circle cx="18" cy="6" r="3"></circle>
                        <circle cx="6" cy="18" r="3"></circle>
                        <path d="M18 9a9 9 0 0 1-9 9"></path>
                    </svg>
                    <span class="branch-name">{currentBranch}</span>
                    {#if unPushedCommits > 0}
                        <span class="unpushed-badge" title={t("misc.unpushed-commits")}>↑</span>
                    {/if}
                </div>
            {/if}
        </div>
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
            <div class="commit-msg-header">
                <button
                    class="commit-template-btn"
                    onclick={() => showCommitTemplates = !showCommitTemplates}
                    aria-label={t("misc.commit-template")}
                    title={t("misc.use-commit-template")}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                </button>
                <label class="amend-checkbox">
                    <input type="checkbox" bind:checked={amendCommit} />
                    <span>{t("misc.amend-commit")}</span>
                </label>
            </div>
            
            {#if showCommitTemplates}
                <div class="commit-templates">
                    {#each commitTemplates as template}
                        <button
                            class="template-item"
                            onclick={() => useTemplate(template.template)}
                        >
                            {template.label}
                        </button>
                    {/each}
                </div>
            {/if}
            
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

        <div class="commit-actions {isSmallScreen ? 'commit-actions-mobile' : isTablet ? 'commit-actions-tablet' : ''}">
            <button
                class="mod-cta commit-btn {isSmallScreen ? 'commit-btn-mobile' : ''}"
                onclick={commit}
                disabled={!status || (status.changed.length === 0 && status.staged.length === 0)}
            >
                {#if !isSmallScreen}
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
                {/if}
                {isSmallScreen ? '提交' : t("commands.commit")}
            </button>
            {#if !isSmallScreen || deviceType === 'tablet'}
                <button
                    class="mod-cta commit-btn {isSmallScreen ? 'commit-btn-mobile' : ''}"
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
            {/if}
        </div>
        
        <div class="quick-actions">
            <button
                class="action-btn"
                onclick={pull}
                disabled={loading}
                title={t("commands.pull")}
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
                >
                    <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3"></path>
                    <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"></path>
                    <path d="M12 20v-9"></path>
                    <path d="m9 14 3 3 3-3"></path>
                </svg>
                <span>{t("commands.pull")}</span>
            </button>
            <button
                class="action-btn"
                onclick={push}
                disabled={loading}
                class:has-unpushed={unPushedCommits > 0}
                title={t("commands.push")}
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
                >
                    <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3"></path>
                    <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"></path>
                    <path d="M12 4v9"></path>
                    <path d="m9 10 3-3 3 3"></path>
                </svg>
                <span>{t("commands.push")}</span>
            </button>
            <button
                class="action-btn action-btn-danger"
                onclick={discardAll}
                disabled={loading || !status || (status.changed.length === 0 && status.staged.length === 0)}
                title={t("commands.discard-all")}
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
                >
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
                <span>{t("commands.discard-all")}</span>
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
                                            unstageAll(e);
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
        align-items: flex-start;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--background-modifier-border);
    }

    .header-left {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .sidebar-header h3 {
        margin: 0;
        font-size: 1.2em;
        color: var(--text-normal);
    }

    .branch-info {
        display: flex;
        align-items: center;
        font-size: var(--font-ui-smaller);
        color: var(--text-muted);
        padding: 2px 8px;
        background: var(--background-secondary);
        border-radius: 12px;
        gap: 2px;
    }

    .branch-name {
        font-weight: 500;
        color: var(--text-accent);
    }

    .unpushed-badge {
        margin-left: 4px;
        padding: 0 4px;
        background: var(--interactive-accent);
        color: var(--text-on-accent);
        border-radius: 8px;
        font-size: 10px;
        font-weight: 600;
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

    .commit-msg-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        gap: 8px;
    }

    .commit-template-btn {
        padding: 4px 8px;
        background: var(--background-secondary);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        color: var(--text-muted);
        transition: all 0.15s ease;
    }

    .commit-template-btn:hover {
        background: var(--background-modifier-hover);
        color: var(--text-normal);
    }

    .amend-checkbox {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: var(--font-ui-smaller);
        color: var(--text-muted);
        cursor: pointer;
        user-select: none;
    }

    .amend-checkbox input[type="checkbox"] {
        cursor: pointer;
    }

    .amend-checkbox:hover {
        color: var(--text-normal);
    }

    .commit-templates {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 8px;
        padding: 8px;
        background: var(--background-secondary);
        border-radius: 4px;
    }

    .template-item {
        padding: 4px 12px;
        background: var(--background-primary);
        border: 1px solid var(--background-modifier-border);
        border-radius: 12px;
        cursor: pointer;
        font-size: var(--font-ui-smaller);
        color: var(--text-normal);
        transition: all 0.15s ease;
    }

    .template-item:hover {
        background: var(--interactive-hover);
        border-color: var(--interactive-accent);
        color: var(--text-accent);
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
        bottom: 8px;
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

    .commit-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 12px;
    }

    /* 移动端按钮布局优化 */
    .commit-actions-mobile {
        flex-direction: column;
        gap: 6px;
    }

    /* 平板端按钮布局优化 */
    .commit-actions-tablet {
        gap: 6px;
    }

    .commit-actions button {
        flex: 1;
        min-width: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: var(--font-ui-small);
        font-weight: 500;
    }

    /* 移动端按钮样式 */
    .commit-actions-mobile .mod-cta {
        min-height: 44px; /* 更好的触摸目标 */
        font-size: 16px; /* 防止iOS缩放 */
        padding: 12px 16px;
        width: 100%;
    }

    /* 平板端按钮样式 */
    .commit-actions-tablet .mod-cta {
        min-height: 40px;
        padding: 10px 14px;
    }

    .quick-actions {
        display: flex;
        gap: 6px;
        margin-bottom: 16px;
        padding: 8px;
        background: var(--background-secondary);
        border-radius: 4px;
    }

    .action-btn {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 8px;
        background: var(--background-primary);
        border: 1px solid var(--background-modifier-border);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.15s ease;
        font-size: var(--font-ui-smaller);
        color: var(--text-normal);
    }

    .action-btn:hover:not(:disabled) {
        background: var(--interactive-hover);
        border-color: var(--interactive-accent);
        color: var(--interactive-accent);
    }

    .action-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .action-btn.has-unpushed {
        border-color: var(--interactive-accent);
        background: var(--interactive-accent-hover);
    }

    .action-btn-danger:hover:not(:disabled) {
        background: var(--background-modifier-error);
        border-color: var(--text-error);
        color: var(--text-error);
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

        .quick-actions {
            flex-wrap: wrap;
        }

        .action-btn {
            min-width: calc(50% - 3px);
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