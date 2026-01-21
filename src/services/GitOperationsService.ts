/**
 * Service for Git operations (commit, push, pull, fetch)
 */

import { Notice, moment } from "obsidian";
import { t } from "../i18n";
import { SimpleGit } from "../gitManager/simpleGit";
import { IsomorphicGit } from "../gitManager/isomorphicGit";
import { CurrentGitAction, NoNetworkError } from "../types";
import type { Status, UnstagedFile } from "../types";
import type {
    CommitOptions,
    CommitAndSyncOptions,
    GitOperationResult,
    Result,
} from "./types";
import { BaseService } from "./BaseService";
import { CustomMessageModal } from "../ui/modals/customMessageModal";
import { spawnAsync } from "../utils";

export class GitOperationsService extends BaseService {
    /**
     * Commit changes with type-safe options
     */
    async commit(options: CommitOptions): Promise<Result<GitOperationResult>> {
        if (!(await this.ensureGitReady())) {
            return {
                success: false,
                error: new Error("Git is not ready"),
            };
        }

        try {
            const hadConflict = this.plugin.localStorage.getConflict();
            let status: Status | undefined;
            let stagedFiles: { vaultPath: string; path: string }[] = [];
            let unstagedFiles: (UnstagedFile & { vaultPath: string })[] = [];

            if (this.plugin.gitManager instanceof SimpleGit) {
                await this.plugin.mayDeleteConflictFile();
                status = await this.plugin.updateCachedStatus();

                if (status.conflicted.length === 0) {
                    this.plugin.localStorage.setConflict(false);
                }

                // Check for conflicts on auto backup
                if (options.fromAuto && status.conflicted.length > 0) {
                    this.displayError(
                        t("notices.cannot-push-conflicts", {
                            count: status.conflicted.length,
                            file:
                                status.conflicted.length === 1
                                    ? t("misc.file")
                                    : t("misc.files"),
                        })
                    );
                    await this.plugin.handleConflict(status.conflicted);
                    return { success: false, error: new Error("Conflicts detected") };
                }

                stagedFiles = status.staged;
                unstagedFiles = status.changed as unknown as (UnstagedFile & {
                    vaultPath: string;
                })[];
            } else {
                // Isomorphic-git section
                if (options.fromAuto && hadConflict) {
                    this.displayError(
                        "Did not commit, because you have conflicts. Please resolve them and commit per command."
                    );
                    return { success: false, error: new Error("Conflicts detected") };
                }

                if (hadConflict) {
                    await this.plugin.mayDeleteConflictFile();
                }

                const gitManager = this.plugin.gitManager as IsomorphicGit;
                if (options.onlyStaged) {
                    stagedFiles = await gitManager.getStagedFiles();
                } else {
                    const res = await gitManager.getUnstagedFiles();
                    unstagedFiles = res.map(({ path, type }) => ({
                        vaultPath: this.plugin.gitManager.getRelativeVaultPath(path),
                        path,
                        type,
                    }));
                }
            }

            // Check for too big files
            if (
                await this.plugin.tools.hasTooBigFiles(
                    options.onlyStaged
                        ? stagedFiles
                        : [...stagedFiles, ...unstagedFiles]
                )
            ) {
                this.plugin.setPluginState({ gitAction: CurrentGitAction.idle });
                return { success: false, error: new Error("Files too big") };
            }

            if (
                unstagedFiles.length + stagedFiles.length === 0 &&
                !hadConflict
            ) {
                this.displayMessage(t("notices.no-changes-to-commit"));
                return {
                    success: true,
                    value: { filesChanged: 0, message: "No changes to commit" },
                };
            }

            // Get commit message
            let commitMessage = await this.getCommitMessage(options);
            if (!commitMessage) {
                this.plugin.setPluginState({ gitAction: CurrentGitAction.idle });
                return { success: false, error: new Error("No commit message") };
            }

            // Perform commit
            let committedFiles: number | undefined;
            if (options.onlyStaged) {
                committedFiles = await this.plugin.gitManager.commit({
                    message: commitMessage,
                    amend: options.amend,
                });
            } else {
                committedFiles = await this.plugin.gitManager.commitAll({
                    message: commitMessage,
                    status,
                    unstagedFiles,
                    amend: options.amend,
                });
            }

            // Handle eventually resolved conflicts
            if (this.plugin.gitManager instanceof SimpleGit) {
                await this.plugin.updateCachedStatus();
            }

            const roughly = committedFiles === undefined;
            const finalCount = committedFiles ?? unstagedFiles.length + stagedFiles.length;

            this.displayMessage(
                t("notices.committed-files", {
                    roughly: roughly ? t("misc.roughly") : "",
                    count: finalCount,
                    file: finalCount === 1 ? t("misc.file") : t("misc.files"),
                })
            );

            this.triggerRefresh();

            return {
                success: true,
                value: {
                    filesChanged: finalCount,
                    message: commitMessage,
                },
            };
        } catch (error) {
            this.displayError(error);
            return { success: false, error: error as Error };
        }
    }

    /**
     * Commit and sync (commit + pull + push)
     */
    async commitAndSync(
        options: CommitAndSyncOptions
    ): Promise<Result<GitOperationResult>> {
        if (!(await this.ensureGitReady())) {
            return { success: false, error: new Error("Git is not ready") };
        }

        try {
            // Pull before commit if needed
            if (
                this.plugin.settings.syncMethod === "reset" &&
                this.plugin.settings.pullBeforePush
            ) {
                await this.pull();
            }

            // Commit
            const commitResult = await this.commit(options);
            if (!commitResult.success) {
                return commitResult;
            }

            // Pull after commit if needed
            if (
                this.plugin.settings.syncMethod !== "reset" &&
                this.plugin.settings.pullBeforePush
            ) {
                await this.pull();
            }

            // Push
            if (!this.plugin.settings.disablePush) {
                const remotesSet = await this.plugin.remotesAreSet();
                const canPush = await this.plugin.gitManager.canPush();
                
                if (remotesSet && canPush) {
                    await this.push();
                } else {
                    this.displayMessage(t("notices.no-commits-to-push"));
                }
            }

            this.plugin.setPluginState({ gitAction: CurrentGitAction.idle });

            return commitResult;
        } catch (error) {
            this.displayError(error);
            return { success: false, error: error as Error };
        }
    }

    /**
     * Push changes to remote
     */
    async push(): Promise<Result<GitOperationResult>> {
        if (!(await this.ensureGitReady())) {
            return { success: false, error: new Error("Git is not ready") };
        }

        if (!(await this.plugin.remotesAreSet())) {
            return { success: false, error: new Error("No remotes set") };
        }

        const hadConflict = this.plugin.localStorage.getConflict();

        try {
            if (this.plugin.gitManager instanceof SimpleGit) {
                await this.plugin.mayDeleteConflictFile();
            }

            // Refresh and check for conflicts
            let status: Status;
            if (
                this.plugin.gitManager instanceof SimpleGit &&
                (status = await this.plugin.updateCachedStatus()).conflicted
                    .length > 0
            ) {
                this.displayError(
                    t("notices.cannot-push-conflicts", {
                        count: status.conflicted.length,
                        file:
                            status.conflicted.length === 1
                                ? t("misc.file")
                                : t("misc.files"),
                    })
                );
                await this.plugin.handleConflict(status.conflicted);
                return { success: false, error: new Error("Conflicts detected") };
            } else if (
                this.plugin.gitManager instanceof IsomorphicGit &&
                hadConflict
            ) {
                this.displayError("Cannot push. You have conflicts");
                return { success: false, error: new Error("Conflicts detected") };
            }

            this.plugin.log("Pushing....");
            const pushedFiles = await this.plugin.gitManager.push();

            if (pushedFiles !== undefined) {
                if (pushedFiles > 0) {
                    this.displayMessage(
                        t("notices.pushed-files", {
                            count: pushedFiles,
                            file:
                                pushedFiles === 1
                                    ? t("misc.file")
                                    : t("misc.files"),
                        })
                    );
                } else {
                    this.displayMessage(t("notices.no-commits-to-push"));
                }
            }

            this.plugin.setPluginState({ offlineMode: false });
            this.triggerRefresh();

            return {
                success: true,
                value: { filesChanged: pushedFiles, message: "Pushed successfully" },
            };
        } catch (error) {
            if (error instanceof NoNetworkError) {
                this.displayMessage(t("notices.no-network-connection"));
            } else {
                this.displayError(error);
            }
            return { success: false, error: error as Error };
        }
    }

    /**
     * Pull changes from remote
     */
    async pull(): Promise<Result<GitOperationResult>> {
        if (!(await this.plugin.remotesAreSet())) {
            return { success: false, error: new Error("No remotes set") };
        }

        try {
            this.plugin.log("Pulling....");
            const pulledFiles = (await this.plugin.gitManager.pull()) || [];
            this.plugin.setPluginState({ offlineMode: false });

            if (pulledFiles.length > 0) {
                this.displayMessage(
                    t("notices.pulled-files", {
                        count: pulledFiles.length,
                        file:
                            pulledFiles.length === 1
                                ? t("misc.file")
                                : t("misc.files"),
                    })
                );
                this.plugin.lastPulledFiles = pulledFiles;
            }

            return {
                success: true,
                value: {
                    filesChanged: pulledFiles.length,
                    message: "Pulled successfully",
                },
            };
        } catch (error) {
            this.displayError(error);
            return { success: false, error: error as Error };
        }
    }

    /**
     * Fetch from remote
     */
    async fetch(): Promise<Result<void>> {
        if (!(await this.plugin.remotesAreSet())) {
            return { success: false, error: new Error("No remotes set") };
        }

        try {
            await this.plugin.gitManager.fetch();
            this.displayMessage(t("notices.fetched-remote"));
            this.plugin.setPluginState({ offlineMode: false });
            this.triggerRefresh();

            return { success: true, value: undefined };
        } catch (error) {
            this.displayError(error);
            return { success: false, error: error as Error };
        }
    }

    /**
     * Get commit message based on options
     */
    private async getCommitMessage(
        options: CommitOptions
    ): Promise<string | null> {
        let message = options.message;

        // Request custom message if needed
        if (
            options.fromAuto &&
            this.plugin.settings.customMessageOnAutoBackup
        ) {
            if (!this.plugin.settings.disablePopups) {
                new Notice(t("notices.auto-backup-message"));
            }

            const modalMessage = await new CustomMessageModal(
                this.plugin
            ).openAndGetResult();

            if (
                modalMessage !== undefined &&
                modalMessage !== "" &&
                modalMessage !== "..."
            ) {
                message = modalMessage;
            } else {
                return null;
            }
        }
        // Use commit message script on desktop
        else if (
            this.plugin.gitManager instanceof SimpleGit &&
            this.plugin.settings.commitMessageScript
        ) {
            const templateScript = this.plugin.settings.commitMessageScript;
            const hostname = this.plugin.localStorage.getHostname() || "";
            let formattedScript = templateScript.replace("{{hostname}}", hostname);
            formattedScript = formattedScript.replace(
                "{{date}}",
                window.moment().format(this.plugin.settings.commitDateFormat)
            );

            const res = await spawnAsync("sh", ["-c", formattedScript], {
                cwd: this.plugin.gitManager.absoluteRepoPath,
            });

            if (res.code !== 0) {
                this.displayError(res.stderr);
            } else if (res.stdout.trim().length === 0) {
                this.displayMessage(
                    "Stdout from commit message script is empty. Using default message."
                );
            } else {
                message = res.stdout;
            }
        }

        return message;
    }
}
