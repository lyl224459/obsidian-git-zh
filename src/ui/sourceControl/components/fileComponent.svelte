<script lang="ts">
    import { setIcon, TFile } from "obsidian";
    import { hoverPreview } from "src/utils";
    import type { GitManager } from "src/gitManager/gitManager";
    import type { FileStatusResult } from "src/types";
    import { DiscardModal } from "src/ui/modals/discardModal";
    import {
        fileIsBinary,
        fileOpenableInObsidian,
        getDisplayPath,
        getNewLeaf,
        mayTriggerFileMenu,
    } from "src/utils";
    import type GitView from "../sourceControl";

    interface Props {
        change: FileStatusResult;
        view: GitView;
        manager: GitManager;
    }

    let { change, view, manager }: Props = $props();
    let buttons: HTMLElement[] = $state([]);

    let side = $derived(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        (view.leaf.getRoot() as any).side == "left" ? "right" : "left"
    );

    $effect(() => {
        for (const b of buttons) if (b) setIcon(b, b.getAttr("data-icon")!);
    });

    function mainClick(event: MouseEvent) {
        event.stopPropagation();
        if (fileIsBinary(change.path)) {
            open(event);
        } else {
            showDiff(event);
        }
    }

    function hover(event: MouseEvent) {
        //Don't show previews of config- or hidden files.
        if (view.app.vault.getAbstractFileByPath(change.vaultPath)) {
            hoverPreview(view.app, event, view, change.vaultPath);
        }
    }

    function open(event: MouseEvent) {
        event.stopPropagation();
        const file = view.app.vault.getAbstractFileByPath(change.vaultPath);

        if (file instanceof TFile) {
            getNewLeaf(view.app, event)
                ?.openFile(file)
                .catch((e) => view.plugin.displayError(e));
        }
    }

    function stage(event: MouseEvent) {
        event.stopPropagation();
        manager
            .stage(change.path, false)
            .catch((e) => view.plugin.displayError(e))
            .finally(() => {
                view.app.workspace.trigger("obsidian-git:refresh");
            });
    }

    function showDiff(event: MouseEvent) {
        event.stopPropagation();
        view.plugin.tools.openDiff({
            aFile: change.path,
            aRef: "",
            event,
        });
    }

    function discard(event: MouseEvent) {
        event.stopPropagation();
        const deleteFile = change.workingDir == "U";
        new DiscardModal({
            app: view.app,
            filesToDeleteCount: deleteFile ? 1 : 0,
            filesToDiscardCount: deleteFile ? 0 : 1,
            path: change.vaultPath,
        })
            .openAndGetResult()
            .then(
                async (result) => {
                    if (result == "delete") {
                        const tFile = view.app.vault.getAbstractFileByPath(
                            change.vaultPath
                        );
                        if (tFile instanceof TFile) {
                            await view.app.fileManager.trashFile(tFile);
                        } else {
                            await view.app.vault.adapter.remove(
                                change.vaultPath
                            );
                        }
                    } else if (result == "discard") {
                        await manager.discard(change.path).finally(() => {
                            view.app.workspace.trigger("obsidian-git:refresh");
                        });
                    }

                    view.app.workspace.trigger("obsidian-git:refresh");
                },
                (e) => view.plugin.displayError(e)
            );
    }
</script>

<!-- TODO: Fix arai-label for left sidebar and if it's too long -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_unknown_aria_attribute -->
<!-- svelte-ignore a11y_mouse_events_have_key_events -->
<main
    onmouseover={hover}
    onclick={mainClick}
    onauxclick={(event) => {
        event.stopPropagation();
        if (event.button == 2)
            mayTriggerFileMenu(
                view.app,
                event,
                change.vaultPath,
                view.leaf,
                "git-source-control"
            );
        else mainClick(event);
    }}
    class="tree-item nav-file"
>
    <div
        class="tree-item-self is-clickable nav-file-title"
        data-path={change.vaultPath}
        data-tooltip-position={side}
        aria-label={change.vaultPath}
    >
        <!-- <div
			data-icon="folder"
			bind:this={buttons[3]}
			style="padding-right: 5px; display: flex;"
		/> -->
        <div class="tree-item-inner nav-file-title-content">
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
                class="svg-icon lucide-file"
                style="margin-right: 6px;"
            >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            {getDisplayPath(change.vaultPath)}
        </div>
        <div class="git-tools">
            <div class="buttons">
                {#if fileOpenableInObsidian(change.vaultPath, view.app)}
                    <div
                        data-icon="file-text"
                        aria-label="Open File"
                        bind:this={buttons[0]}
                        onauxclick={open}
                        onclick={open}
                        class="clickable-icon"
                    ></div>
                {/if}
                <div
                    data-icon="trash"
                    aria-label="Discard changes"
                    bind:this={buttons[1]}
                    onclick={discard}
                    class="clickable-icon"
                ></div>
                <div
                    data-icon="plus"
                    aria-label="Stage changes"
                    bind:this={buttons[2]}
                    onclick={stage}
                    class="clickable-icon"
                ></div>
            </div>
            <div class="type" data-type={change.workingDir}>
                {#if change.workingDir === "M"}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="svg-icon lucide-file-pen-line"
                        style="margin-right: 4px;"
                    >
                        <path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10"/><path d="M12 22v-6l4-4 4 4-6 6"/><path d="M5.5 10.5H10v-4.5L5.5 10.5Z"/></svg>
                    Modified
                {:else if change.workingDir === "D"}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="svg-icon lucide-file-x"
                        style="margin-right: 4px;"
                    >
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m14 12 4 4"/><path d="m18 12-4 4"/></svg>
                    Deleted
                {:else if change.workingDir === "A"}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="svg-icon lucide-file-plus"
                        style="margin-right: 4px;"
                    >
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/><path d="M12 18v-6"/></svg>
                    Added
                {:else if change.workingDir === "R"}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="svg-icon lucide-file-symlink"
                        style="margin-right: 4px;"
                    >
                        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v4"/><path d="M10 14h4"/></svg>
                    Renamed
                {:else}
                    {change.workingDir}
                {/if}
            </div>
        </div>
    </div>
</main>