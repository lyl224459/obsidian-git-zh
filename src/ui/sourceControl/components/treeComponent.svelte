<!-- tslint:disable ts(2345)  -->
<script lang="ts">
    import TreeComponent from "./treeComponent.svelte";

    import type ObsidianGit from "src/main";
    import type { StatusRootTreeItem, TreeItem } from "src/types";
    import { FileType } from "src/types";
    import type GitView from "../sourceControl";
    import FileComponent from "./fileComponent.svelte";
    import PulledFileComponent from "./pulledFileComponent.svelte";
    import StagedFileComponent from "./stagedFileComponent.svelte";
    import { arrayProxyWithNewLength, mayTriggerFileMenu } from "src/utils";
    interface Props {
        hierarchy: StatusRootTreeItem;
        plugin: ObsidianGit;
        view: GitView;
        fileType: FileType;
        topLevel?: boolean;
        closed: Record<string, boolean>;
    }

    let {
        hierarchy,
        plugin,
        view,
        fileType,
        topLevel = false,
        closed = $bindable(),
    }: Props = $props();

    for (const entity of hierarchy.children) {
        if ((entity.children?.length ?? 0) > 100) closed[entity.title] = true;
    }
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
    let side = $derived(
        (view.leaf.getRoot() as any).side == "left" ? "right" : "left"
    );

    function stage(event: MouseEvent, path: string) {
        event.stopPropagation();
        plugin.gitManager
            .stageAll({ dir: path })
            .catch((e) => plugin.displayError(e))
            .finally(() => {
                view.app.workspace.trigger("obsidian-git:refresh");
            });
    }
    function unstage(event: MouseEvent, path: string) {
        event.stopPropagation();
        plugin.gitManager
            .unstageAll({ dir: path })
            .catch((e) => plugin.displayError(e))
            .finally(() => {
                view.app.workspace.trigger("obsidian-git:refresh");
            });
    }
    function discard(event: MouseEvent, item: TreeItem) {
        event.stopPropagation();
        void plugin.discardAll(item.vaultPath);
    }
    function fold(event: MouseEvent, item: TreeItem) {
        event.stopPropagation();
        closed[item.path] = !closed[item.path];
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<main class:topLevel>
    {#each arrayProxyWithNewLength(hierarchy.children, 500) as entity}
        {#if entity.data}
            <div>
                {#if fileType == FileType.staged}
                    <StagedFileComponent
                        change={entity.data}
                        manager={plugin.gitManager}
                        {view}
                    />
                {:else if fileType == FileType.changed}
                    <FileComponent
                        change={entity.data}
                        manager={plugin.gitManager}
                        {view}
                    />
                {:else if fileType == FileType.pulled}
                    <PulledFileComponent change={entity.data} {view} />
                {/if}
            </div>
        {:else}
            <div
                onclick={(event) => fold(event, entity)}
                onauxclick={(event) =>
                    mayTriggerFileMenu(
                        view.app,
                        event,
                        entity.vaultPath,
                        view.leaf,
                        "git-source-control"
                    )}
                class="tree-item nav-folder"
                class:is-collapsed={$closed[entity.path]}
            >
                <div class="tree-item-self is-clickable nav-folder-title">
                    <div
                        class="tree-item-icon nav-folder-collapse-indicator collapse-icon"
                        class:is-collapsed={$closed[entity.path]}
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
                        data-path={entity.vaultPath}
                        data-tooltip-position={side}
                        aria-label={entity.vaultPath}
                    >
                        {entity.title}
                    </div>
                    <div class="git-tools">
                        <div class="buttons">
                            {#if fileType == FileType.changed}
                                <div
                                    data-icon="trash"
                                    aria-label="Discard"
                                    class="clickable-icon"
                                    onclick={(event) => discard(event, entity)}
                                ></div>
                                <div
                                    data-icon="plus"
                                    aria-label="Stage"
                                    class="clickable-icon"
                                    onclick={(event) => stage(event, entity.path)}
                                ></div>
                            {:else if fileType == FileType.staged}
                                <div
                                    data-icon="minus"
                                    aria-label="Unstage"
                                    class="clickable-icon"
                                    onclick={(event) => unstage(event, entity.path)}
                                ></div>
                            {/if}
                        </div>
                        <div class="files-count">{entity.children.length}</div>
                    </div>
                </div>
                {#if !$closed[entity.path]}
                    <div class="tree-item-children nav-folder-children">
                        <TreeComponent
                            hierarchy={entity}
                            {plugin}
                            {view}
                            {fileType}
                            bind:closed
                        />
                    </div>
                {/if}
            </div>
        {/if}
    {/each}
</main>
