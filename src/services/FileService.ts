/**
 * Service for file operations (stage, unstage, discard)
 */

import type { TFile } from "obsidian";
import { BaseService } from "./BaseService";
import type { FileOperationOptions, Result, DiscardResultType } from "./types";
import { DiscardModal } from "../ui/modals/discardModal";
import { assertNever } from "../utils";
import { CurrentGitAction } from "../types";

export class FileService extends BaseService {
    /**
     * Stage a file
     */
    async stageFile(file: TFile): Promise<Result<void>> {
        if (!(await this.ensureGitReady())) {
            return { success: false, error: new Error("Git is not ready") };
        }

        try {
            await this.plugin.gitManager.stage(file.path, true);
            this.triggerRefresh();
            this.plugin.setPluginState({ gitAction: CurrentGitAction.idle });

            return { success: true, value: undefined };
        } catch (error) {
            this.displayError(error);
            return { success: false, error: error as Error };
        }
    }

    /**
     * Unstage a file
     */
    async unstageFile(file: TFile): Promise<Result<void>> {
        if (!(await this.ensureGitReady())) {
            return { success: false, error: new Error("Git is not ready") };
        }

        try {
            await this.plugin.gitManager.unstage(file.path, true);
            this.triggerRefresh();
            this.plugin.setPluginState({ gitAction: CurrentGitAction.idle });

            return { success: true, value: undefined };
        } catch (error) {
            this.displayError(error);
            return { success: false, error: error as Error };
        }
    }

    /**
     * Discard all changes with user confirmation
     */
    async discardAll(
        options: FileOperationOptions = {}
    ): Promise<Result<DiscardResultType>> {
        if (!(await this.ensureGitReady())) {
            return { success: false, error: new Error("Git is not ready") };
        }

        try {
            const status = await this.plugin.gitManager.status({
                path: options.path,
            });

            let filesToDeleteCount = 0;
            let filesToDiscardCount = 0;

            for (const file of status.changed) {
                if (file.workingDir === "U") {
                    filesToDeleteCount++;
                } else {
                    filesToDiscardCount++;
                }
            }

            if (filesToDeleteCount + filesToDiscardCount === 0) {
                return { success: true, value: false };
            }

            const result = await new DiscardModal({
                app: this.plugin.app,
                filesToDeleteCount,
                filesToDiscardCount,
                path: options.path ?? "",
            }).openAndGetResult();

            if (result === false) {
                return { success: true, value: false };
            }

            switch (result) {
                case "discard":
                    await this.plugin.gitManager.discardAll({
                        dir: options.path,
                        status: this.plugin.cachedStatus,
                    });
                    break;

                case "delete": {
                    await this.plugin.gitManager.discardAll({
                        dir: options.path,
                        status: this.plugin.cachedStatus,
                    });

                    const untrackedPaths =
                        await this.plugin.gitManager.getUntrackedPaths({
                            path: options.path,
                            status: this.plugin.cachedStatus,
                        });

                    for (const file of untrackedPaths) {
                        const vaultPath =
                            this.plugin.gitManager.getRelativeVaultPath(file);
                        const tFile =
                            this.plugin.app.vault.getAbstractFileByPath(vaultPath);

                        if (tFile) {
                            await this.plugin.app.fileManager.trashFile(tFile);
                        } else {
                            if (file.endsWith("/")) {
                                await this.plugin.app.vault.adapter.rmdir(
                                    vaultPath,
                                    true
                                );
                            } else {
                                await this.plugin.app.vault.adapter.remove(
                                    vaultPath
                                );
                            }
                        }
                    }
                    break;
                }

                default:
                    assertNever(result);
            }

            this.triggerRefresh();
            return { success: true, value: result };
        } catch (error) {
            this.displayError(error);
            return { success: false, error: error as Error };
        }
    }

    /**
     * Add file to .gitignore
     */
    async addToGitignore(
        filePath: string,
        isFolder?: boolean
    ): Promise<Result<void>> {
        try {
            const gitRelativePath =
                this.plugin.gitManager.getRelativeRepoPath(filePath, true);

            const gitignoreRule = this.convertPathToAbsoluteGitignoreRule({
                isFolder,
                gitRelativePath,
            });

            await this.plugin.app.vault.adapter.append(
                this.plugin.gitManager.getRelativeVaultPath(".gitignore"),
                "\n" + gitignoreRule
            );

            this.triggerRefresh();
            return { success: true, value: undefined };
        } catch (error) {
            this.displayError(error);
            return { success: false, error: error as Error };
        }
    }

    /**
     * Helper to convert path to absolute gitignore rule
     */
    private convertPathToAbsoluteGitignoreRule({
        isFolder,
        gitRelativePath,
    }: {
        isFolder?: boolean;
        gitRelativePath: string;
    }): string {
        let rule = "/" + gitRelativePath;
        if (isFolder && !rule.endsWith("/")) {
            rule += "/";
        }
        return rule;
    }
}
