/**
 * Service for managing inline comments on diff lines
 */

import type ObsidianGit from "src/main";
import { BaseService } from "./BaseService";
import type { Result } from "./types";

/**
 * Comment data structure
 */
export interface DiffComment {
    id: string;
    filePath: string;
    lineNumber: number;
    content: string;
    author: string;
    timestamp: number;
    commitHash?: string;
}

/**
 * Comment storage structure
 */
interface CommentStorage {
    version: number;
    comments: Record<string, DiffComment[]>; // filePath -> comments array
}

const COMMENT_STORAGE_FILE = ".obsidian/plugins/obsidian-git/comments.json";
const STORAGE_VERSION = 1;

export class CommentService extends BaseService {
    private comments: Map<string, DiffComment[]> = new Map();
    private loaded = false;

    constructor(plugin: ObsidianGit) {
        super(plugin);
    }

    /**
     * Load comments from storage
     */
    async loadComments(): Promise<Result<void>> {
        const vaultAdapter = this.app.vault.adapter;

        try {
            if (!(await vaultAdapter.exists(COMMENT_STORAGE_FILE))) {
                this.comments = new Map();
                this.loaded = true;
                return { success: true, value: undefined };
            }

            const data = await vaultAdapter.read(COMMENT_STORAGE_FILE);
            const storage = JSON.parse(data) as CommentStorage;

            this.comments.clear();
            for (const [filePath, commentsList] of Object.entries(storage.comments)) {
                this.comments.set(filePath, commentsList);
            }

            this.loaded = true;
            return { success: true, value: undefined };
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.displayError(err);
            return { success: false, error: err };
        }
    }

    /**
     * Save comments to storage
     */
    async saveComments(): Promise<Result<void>> {
        const vaultAdapter = this.app.vault.adapter;
        const storage: CommentStorage = {
            version: STORAGE_VERSION,
            comments: Object.fromEntries(this.comments.entries()),
        };

        try {
            await vaultAdapter.write(
                COMMENT_STORAGE_FILE,
                JSON.stringify(storage, null, 2)
            );

            return { success: true, value: undefined };
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.displayError(err);
            return { success: false, error: err };
        }
    }

    /**
     * Get comments for a specific file
     */
    async getCommentsForFile(filePath: string): Promise<DiffComment[]> {
        if (!this.loaded) {
            await this.loadComments();
        }
        return this.comments.get(filePath) || [];
    }

    /**
     * Add a comment
     */
    async addComment(
        filePath: string,
        lineNumber: number,
        content: string,
        commitHash?: string
    ): Promise<Result<DiffComment>> {
        if (!this.loaded) {
            await this.loadComments();
        }

        const comment: DiffComment = {
            id: this.generateId(),
            filePath,
            lineNumber,
            content,
            author: await this.getAuthorName(),
            timestamp: Date.now(),
            commitHash,
        };

        const fileComments = this.comments.get(filePath) || [];
        fileComments.push(comment);
        this.comments.set(filePath, fileComments);

        await this.saveComments();

        return { success: true, value: comment };
    }

    /**
     * Update a comment
     */
    async updateComment(
        commentId: string,
        newContent: string
    ): Promise<Result<DiffComment>> {
        if (!this.loaded) {
            await this.loadComments();
        }

        for (const [, comments] of this.comments.entries()) {
            const comment = comments.find((c) => c.id === commentId);
            if (comment) {
                comment.content = newContent;
                comment.timestamp = Date.now();
                await this.saveComments();
                return { success: true, value: comment };
            }
        }

        return {
            success: false,
            error: new Error("Comment not found"),
        };
    }

    /**
     * Delete a comment
     */
    async deleteComment(commentId: string): Promise<Result<void>> {
        if (!this.loaded) {
            await this.loadComments();
        }

        for (const [filePath, comments] of this.comments.entries()) {
            const index = comments.findIndex((c) => c.id === commentId);
            if (index !== -1) {
                comments.splice(index, 1);
                if (comments.length === 0) {
                    this.comments.delete(filePath);
                }
                await this.saveComments();
                return { success: true, value: undefined };
            }
        }

        return {
            success: false,
            error: new Error("Comment not found"),
        };
    }

    /**
     * Get all comments
     */
    async getAllComments(): Promise<DiffComment[]> {
        if (!this.loaded) {
            await this.loadComments();
        }

        const allComments: DiffComment[] = [];
        for (const comments of this.comments.values()) {
            allComments.push(...comments);
        }
        return allComments;
    }

    /**
     * Clear all comments
     */
    async clearAllComments(): Promise<Result<void>> {
        this.comments.clear();
        return await this.saveComments();
    }

    /**
     * Generate unique ID for comment
     */
    private generateId(): string {
        return `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get author name from git config
     */
    private async getAuthorName(): Promise<string> {
        try {
            const name = await this.plugin.gitManager.getConfig("user.name");
            return name || "Unknown";
        } catch {
            return "Unknown";
        }
    }
}
