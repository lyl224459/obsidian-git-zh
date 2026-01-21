import type { HoverParent, HoverPopover, WorkspaceLeaf } from "obsidian";
import { ItemView } from "obsidian";
import { COMMIT_SIDEBAR_VIEW_CONFIG } from "src/constants";
import type ObsidianGit from "src/main";
import CommitSidebarViewComponent from "./commitSidebar.svelte";
import { mount, unmount } from "svelte";

export default class GitCommitSidebarView extends ItemView implements HoverParent {
    plugin: ObsidianGit;
    private _view: Record<string, unknown> | undefined;
    hoverPopover: HoverPopover | null;

    constructor(leaf: WorkspaceLeaf, plugin: ObsidianGit) {
        super(leaf);
        this.plugin = plugin;
        this.hoverPopover = null;
    }

    override getViewType(): string {
        return COMMIT_SIDEBAR_VIEW_CONFIG.type;
    }

    override getDisplayText(): string {
        return COMMIT_SIDEBAR_VIEW_CONFIG.name;
    }

    override getIcon(): string {
        return COMMIT_SIDEBAR_VIEW_CONFIG.icon;
    }

    override onClose(): Promise<void> {
        if (this._view) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            unmount(this._view);
        }
        return super.onClose();
    }

    reload(): void {
        if (this._view) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            unmount(this._view);
        }
        this._view = mount(CommitSidebarViewComponent, {
            target: this.contentEl,
            props: {
                plugin: this.plugin,
                view: this,
            },
        });
    }

    override onOpen(): Promise<void> {
        this.reload();
        return super.onOpen();
    }
}