/**
 * Service for repository operations (init, clone)
 */

import { Notice, normalizePath } from "obsidian";
import { t } from "../i18n";
import { BaseService } from "./BaseService";
import type { Result } from "./types";
import { GeneralModal } from "../ui/modals/generalModal";
import { formatRemoteUrl } from "../utils";
import { IsomorphicGit } from "../gitManager/isomorphicGit";

export class RepositoryService extends BaseService {
    /**
     * Initialize a new repository
     */
    async createNewRepo(): Promise<Result<void>> {
        try {
            await this.plugin.gitManager.init();
            new Notice(t("notices.initialized-repo"));
            await this.plugin.init({ fromReload: true });

            return { success: true, value: undefined };
        } catch (error) {
            this.displayError(error);
            return { success: false, error: error as Error };
        }
    }

    /**
     * Clone a repository
     */
    async cloneRepo(): Promise<Result<void>> {
        try {
            const url = await this.getRemoteUrl();
            if (!url) {
                return {
                    success: false,
                    error: new Error("No URL provided"),
                };
            }

            const dir = await this.getCloneDirectory();
            if (dir === undefined) {
                return {
                    success: false,
                    error: new Error("No directory provided"),
                };
            }

            const depth = await this.getCloneDepth();
            if (depth === null) {
                return {
                    success: false,
                    error: new Error("Invalid depth"),
                };
            }

            // Handle config directory conflict
            if (dir === ".") {
                const shouldContinue = await this.handleConfigDirConflict();
                if (!shouldContinue) {
                    new Notice(t("notices.aborted-clone"));
                    return {
                        success: false,
                        error: new Error("Clone aborted"),
                    };
                }
            }

            new Notice(t("notices.cloning-repo", { dir }));

            const oldBase = this.plugin.settings.basePath;
            const customDir = dir && dir !== ".";

            // Set new base path before clone
            if (customDir) {
                this.plugin.settings.basePath = dir;
            }

            try {
                await this.plugin.gitManager.clone(
                    formatRemoteUrl(url),
                    dir,
                    depth
                );

                new Notice(t("notices.cloned-repo-success"));
                new Notice(t("notices.restart-obsidian"));

                if (customDir) {
                    await this.plugin.saveSettings();
                }

                return { success: true, value: undefined };
            } catch (error) {
                this.displayError(error);
                this.plugin.settings.basePath = oldBase;
                await this.plugin.saveSettings();
                return { success: false, error: error as Error };
            }
        } catch (error) {
            this.displayError(error);
            return { success: false, error: error as Error };
        }
    }

    /**
     * Get remote URL from user
     */
    private async getRemoteUrl(): Promise<string | undefined> {
        const modal = new GeneralModal(this.plugin, {
            placeholder: "Enter remote URL",
        });
        return await modal.openAndGetResult();
    }

    /**
     * Get clone directory from user
     */
    private async getCloneDirectory(): Promise<string | undefined> {
        const confirmOption = "Vault Root";
        let dir = await new GeneralModal(this.plugin, {
            options:
                this.plugin.gitManager instanceof IsomorphicGit
                    ? [confirmOption]
                    : [],
            placeholder:
                "Enter directory for clone. It needs to be empty or not existent.",
            allowEmpty: this.plugin.gitManager instanceof IsomorphicGit,
        }).openAndGetResult();

        if (dir === undefined) {
            return undefined;
        }

        if (dir === confirmOption) {
            dir = ".";
        }

        dir = normalizePath(dir);
        if (dir === "/") {
            dir = ".";
        }

        return dir;
    }

    /**
     * Get clone depth from user
     */
    private async getCloneDepth(): Promise<number | undefined | null> {
        const depth = await new GeneralModal(this.plugin, {
            placeholder: "Specify depth of clone. Leave empty for full clone.",
            allowEmpty: true,
        }).openAndGetResult();

        if (depth === undefined) {
            return undefined;
        }

        if (depth === "") {
            return undefined;
        }

        const depthInt = parseInt(depth);
        if (isNaN(depthInt)) {
            new Notice(t("notices.invalid-depth"));
            return null;
        }

        return depthInt;
    }

    /**
     * Handle potential config directory conflict
     */
    private async handleConfigDirConflict(): Promise<boolean> {
        const modal = new GeneralModal(this.plugin, {
            options: ["NO", "YES"],
            placeholder: `Does your remote repo contain a ${this.plugin.app.vault.configDir} directory at the root?`,
            onlySelection: true,
        });

        const containsConflictDir = await modal.openAndGetResult();

        if (containsConflictDir === undefined) {
            return false;
        }

        if (containsConflictDir === "YES") {
            const confirmOption = "DELETE ALL YOUR LOCAL CONFIG AND PLUGINS";
            const confirmModal = new GeneralModal(this.plugin, {
                options: ["Abort clone", confirmOption],
                placeholder: `To avoid conflicts, the local ${this.plugin.app.vault.configDir} directory needs to be deleted.`,
                onlySelection: true,
            });

            const shouldDelete =
                (await confirmModal.openAndGetResult()) === confirmOption;

            if (shouldDelete) {
                await this.plugin.app.vault.adapter.rmdir(
                    this.plugin.app.vault.configDir,
                    true
                );
                return true;
            } else {
                return false;
            }
        }

        return true;
    }
}
