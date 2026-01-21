/**
 * Service layer types for better type safety
 */

import type { TFile } from "obsidian";
import type { FileStatusResult, Status } from "../types";

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> =
    | { success: true; value: T }
    | { success: false; error: E };

/**
 * Git operation result
 */
export interface GitOperationResult {
    filesChanged?: number;
    message?: string;
}

/**
 * Commit options with strict typing
 */
export interface CommitOptions {
    readonly message: string;
    readonly onlyStaged?: boolean;
    readonly amend?: boolean;
    readonly fromAuto?: boolean;
}

/**
 * Commit and sync options
 */
export interface CommitAndSyncOptions extends CommitOptions {
    readonly fromAutoBackup: boolean;
}

/**
 * Branch information
 */
export interface BranchOperationResult {
    readonly branchName: string;
    readonly success: boolean;
}

/**
 * File operation options
 */
export interface FileOperationOptions {
    readonly path?: string;
    readonly status?: Status;
}

/**
 * Discard result type-safe union
 */
export type DiscardResultType = false | "delete" | "discard";

/**
 * Remote operation result
 */
export interface RemoteOperationResult {
    readonly remoteName?: string;
    readonly url?: string;
    readonly success: boolean;
}

/**
 * Service interface that all services must implement
 */
export interface IService {
    /**
     * Initialize the service
     */
    init?(): Promise<void>;
    
    /**
     * Cleanup the service
     */
    destroy?(): void;
}
