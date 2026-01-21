/**
 * Service for branch operations
 */

import { t } from "../i18n";
import { BaseService } from "./BaseService";
import type { BranchOperationResult, Result } from "./types";
import { BranchModal } from "../ui/modals/branchModal";
import { GeneralModal } from "../ui/modals/generalModal";
import { splitRemoteBranch } from "../utils";

export class BranchService extends BaseService {
    /**
     * Switch to a different branch
     */
    async switchBranch(): Promise<Result<BranchOperationResult>> {
        if (!(await this.ensureGitReady())) {
            return { success: false, error: new Error("Git is not ready") };
        }

        try {
            const branchInfo = await this.plugin.gitManager.branchInfo();
            const selectedBranch = await new BranchModal(
                this.plugin,
                branchInfo.branches
            ).openAndGetReslt();

            if (!selectedBranch) {
                return {
                    success: false,
                    error: new Error("No branch selected"),
                };
            }

            await this.plugin.gitManager.checkout(selectedBranch);
            this.displayMessage(
                t("notices.switched-branch", { branch: selectedBranch })
            );
            this.triggerRefresh();
            await this.plugin.branchBar?.display();

            return {
                success: true,
                value: { branchName: selectedBranch, success: true },
            };
        } catch (error) {
            this.displayError(error);
            return { success: false, error: error as Error };
        }
    }

    /**
     * Switch to a remote branch
     */
    async switchRemoteBranch(): Promise<Result<BranchOperationResult>> {
        if (!(await this.ensureGitReady())) {
            return { success: false, error: new Error("Git is not ready") };
        }

        try {
            const selectedBranch = await this.plugin.selectRemoteBranch();
            if (!selectedBranch) {
                return {
                    success: false,
                    error: new Error("No branch selected"),
                };
            }

            const [remote, branch] = splitRemoteBranch(selectedBranch);

            if (!branch || !remote) {
                return {
                    success: false,
                    error: new Error("Invalid branch format"),
                };
            }

            await this.plugin.gitManager.checkout(branch, remote);
            this.displayMessage(
                t("notices.switched-branch", { branch: selectedBranch })
            );
            await this.plugin.branchBar?.display();

            return {
                success: true,
                value: { branchName: selectedBranch, success: true },
            };
        } catch (error) {
            this.displayError(error);
            return { success: false, error: error as Error };
        }
    }

    /**
     * Create a new branch
     */
    async createBranch(): Promise<Result<BranchOperationResult>> {
        if (!(await this.ensureGitReady())) {
            return { success: false, error: new Error("Git is not ready") };
        }

        try {
            const newBranch = await new GeneralModal(this.plugin, {
                placeholder: "Create new branch",
            }).openAndGetResult();

            if (!newBranch) {
                return {
                    success: false,
                    error: new Error("No branch name provided"),
                };
            }

            await this.plugin.gitManager.createBranch(newBranch);
            this.displayMessage(
                t("notices.created-branch", { branch: newBranch })
            );
            await this.plugin.branchBar?.display();

            return {
                success: true,
                value: { branchName: newBranch, success: true },
            };
        } catch (error) {
            this.displayError(error);
            return { success: false, error: error as Error };
        }
    }

    /**
     * Delete a branch with confirmation
     */
    async deleteBranch(): Promise<Result<BranchOperationResult>> {
        if (!(await this.ensureGitReady())) {
            return { success: false, error: new Error("Git is not ready") };
        }

        try {
            const branchInfo = await this.plugin.gitManager.branchInfo();
            if (branchInfo.current) {
                branchInfo.branches.remove(branchInfo.current);
            }

            const branch = await new GeneralModal(this.plugin, {
                options: branchInfo.branches,
                placeholder: "Delete branch",
                onlySelection: true,
            }).openAndGetResult();

            if (!branch) {
                return {
                    success: false,
                    error: new Error("No branch selected"),
                };
            }

            let force = false;
            const merged = await this.plugin.gitManager.branchIsMerged(branch);

            if (!merged) {
                const forceAnswer = await new GeneralModal(this.plugin, {
                    options: ["YES", "NO"],
                    placeholder: t("notices.branch-not-merged"),
                    onlySelection: true,
                }).openAndGetResult();

                if (forceAnswer !== "YES") {
                    return {
                        success: false,
                        error: new Error("Delete cancelled"),
                    };
                }
                force = true;
            }

            await this.plugin.gitManager.deleteBranch(branch, force);
            this.displayMessage(t("notices.deleted-branch", { branch }));
            await this.plugin.branchBar?.display();

            return {
                success: true,
                value: { branchName: branch, success: true },
            };
        } catch (error) {
            this.displayError(error);
            return { success: false, error: error as Error };
        }
    }
}
