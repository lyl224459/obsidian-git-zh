/**
 * Base service class that all services extend
 */

import type ObsidianGit from "../main";
import type { IService } from "./types";

export abstract class BaseService implements IService {
    constructor(protected readonly plugin: ObsidianGit) {}

    /**
     * Helper to check if git is ready
     */
    protected async ensureGitReady(): Promise<boolean> {
        if (!this.plugin.gitReady) {
            await this.plugin.init({ fromReload: true });
        }
        return this.plugin.gitReady;
    }

    /**
     * Helper to display error messages
     */
    protected displayError(error: unknown): void {
        this.plugin.displayError(error);
    }

    /**
     * Helper to display success messages
     */
    protected displayMessage(message: string): void {
        this.plugin.displayMessage(message);
    }

    /**
     * Helper to trigger refresh
     */
    protected triggerRefresh(): void {
        this.plugin.app.workspace.trigger("obsidian-git:refresh");
    }

    /**
     * Optional initialization hook
     */
    async init?(): Promise<void>;

    /**
     * Optional cleanup hook
     */
    destroy?(): void;
}
