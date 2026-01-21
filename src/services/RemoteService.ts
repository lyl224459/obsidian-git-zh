/**
 * Service for remote repository operations
 */

import { Notice } from "obsidian";
import { t } from "../i18n";
import { BaseService } from "./BaseService";
import type { RemoteOperationResult, Result } from "./types";
import { GeneralModal } from "../ui/modals/generalModal";
import { formatRemoteUrl } from "../utils";

export class RemoteService extends BaseService {
    /**
     * Edit or add a remote
     */
    async editRemotes(): Promise<Result<RemoteOperationResult>> {
        if (!(await this.ensureGitReady())) {
            return { success: false, error: new Error("Git is not ready") };
        }

        try {
            const remotes = await this.plugin.gitManager.getRemotes();

            const nameModal = new GeneralModal(this.plugin, {
                options: remotes,
                placeholder:
                    "Select or create a new remote by typing its name and selecting it",
            });
            const remoteName = await nameModal.openAndGetResult();

            if (!remoteName) {
                return {
                    success: false,
                    error: new Error("No remote name provided"),
                };
            }

            const oldUrl = await this.plugin.gitManager.getRemoteUrl(remoteName);

            const urlModal = new GeneralModal(this.plugin, {
                initialValue: oldUrl,
                placeholder: "Enter remote URL",
            });
            const remoteURL = await urlModal.openAndGetResult();

            if (!remoteURL) {
                return {
                    success: false,
                    error: new Error("No remote URL provided"),
                };
            }

            await this.plugin.gitManager.setRemote(
                remoteName,
                formatRemoteUrl(remoteURL)
            );

            return {
                success: true,
                value: {
                    remoteName,
                    url: remoteURL,
                    success: true,
                },
            };
        } catch (error) {
            this.displayError(error);
            return { success: false, error: error as Error };
        }
    }

    /**
     * Select a remote branch
     */
    async selectRemoteBranch(): Promise<Result<string>> {
        if (!(await this.ensureGitReady())) {
            return { success: false, error: new Error("Git is not ready") };
        }

        try {
            let remotes = await this.plugin.gitManager.getRemotes();
            let selectedRemote: string | undefined;

            if (remotes.length === 0) {
                const editResult = await this.editRemotes();
                if (editResult.success && editResult.value.remoteName) {
                    selectedRemote = editResult.value.remoteName;
                } else {
                    remotes = await this.plugin.gitManager.getRemotes();
                }
            }

            const nameModal = new GeneralModal(this.plugin, {
                options: remotes,
                placeholder:
                    "Select or create a new remote by typing its name and selecting it",
            });
            const remoteName =
                selectedRemote ?? (await nameModal.openAndGetResult());

            if (!remoteName) {
                return {
                    success: false,
                    error: new Error("No remote selected"),
                };
            }

            this.displayMessage("Fetching remote branches");
            await this.plugin.gitManager.fetch(remoteName);

            const branches =
                await this.plugin.gitManager.getRemoteBranches(remoteName);

            const branchModal = new GeneralModal(this.plugin, {
                options: branches,
                placeholder:
                    "Select or create a new remote branch by typing its name and selecting it",
            });
            const selectedBranch = await branchModal.openAndGetResult();

            if (!selectedBranch) {
                return {
                    success: false,
                    error: new Error("No branch selected"),
                };
            }

            return { success: true, value: selectedBranch };
        } catch (error) {
            this.displayError(error);
            return { success: false, error: error as Error };
        }
    }

    /**
     * Set upstream branch
     */
    async setUpstreamBranch(): Promise<Result<string>> {
        if (!(await this.ensureGitReady())) {
            return { success: false, error: new Error("Git is not ready") };
        }

        try {
            const remoteBranchResult = await this.selectRemoteBranch();

            if (!remoteBranchResult.success) {
                this.displayError(t("notices.aborted-no-upstream"), 10000);
                return remoteBranchResult;
            }

            const remoteBranch = remoteBranchResult.value;
            await this.plugin.gitManager.updateUpstreamBranch(remoteBranch);
            this.displayMessage(
                t("notices.set-upstream", { branch: remoteBranch })
            );

            return { success: true, value: remoteBranch };
        } catch (error) {
            this.displayError(error);
            return { success: false, error: error as Error };
        }
    }

    /**
     * Check if remotes are properly set
     */
    async ensureRemotesSet(): Promise<boolean> {
        if (this.plugin.settings.updateSubmodules) {
            return true;
        }

        const branchInfo = await this.plugin.gitManager.branchInfo();
        if (!branchInfo.tracking) {
            new Notice(t("notices.no-upstream-branch"));
            const result = await this.setUpstreamBranch();
            return result.success;
        }

        return true;
    }
}
