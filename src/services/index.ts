/**
 * Service layer exports
 * 
 * This module provides a clean service-oriented architecture for the plugin,
 * separating concerns and improving testability.
 */

export { BaseService } from "./BaseService";
export { GitOperationsService } from "./GitOperationsService";
export { BranchService } from "./BranchService";
export { FileService } from "./FileService";
export { RemoteService } from "./RemoteService";
export { RepositoryService } from "./RepositoryService";

export type {
    Result,
    GitOperationResult,
    CommitOptions,
    CommitAndSyncOptions,
    BranchOperationResult,
    FileOperationOptions,
    DiscardResultType,
    RemoteOperationResult,
    IService,
} from "./types";
