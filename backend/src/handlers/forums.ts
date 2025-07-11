import { pool } from '../db/pool.js';
import { getEnvValue } from '../utils/getEnv.js';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_KEY = getEnvValue('JWT_KEY', 'JWT_KEY_FILE')!;

export const getAllForumsHandler = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
        const result = await pool.query(
            `SELECT 
                f.id,
                f.name,
                f.description,
                f.created_at AS "createdAt",
                f.updated_at AS "updatedAt",
                COUNT(DISTINCT t.id) AS "topicsCount",
                COUNT(DISTINCT p.id) AS "postsCount"
            FROM forums f
            LEFT JOIN topics t ON f.id = t.forum_id
            LEFT JOIN posts p ON t.id = p.topic_id
            GROUP BY f.id, f.name, f.description, f.created_at, f.updated_at
            ORDER BY f.name`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('getAllForums error:', err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

export const getForumByIdHandler = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const forumId = req.params.id;
    try {
        const forumResult = await pool.query(
            `SELECT 
                f.id,
                f.name,
                f.description,
                f.created_at AS "createdAt",
                f.updated_at AS "updatedAt"
            FROM forums f
            WHERE f.id = $1`,
            [forumId]
        );

        if (forumResult.rows.length === 0) {
            res.status(404).json({ message: 'Forum non trouvé.' });
            return;
        }

        const topicsResult = await pool.query(
            `SELECT 
                t.id,
                t.title,
                t.content,
                t.is_pinned AS "isPinned",
                t.is_locked AS "isLocked",
                t.views_count AS "viewsCount",
                t.created_at AS "createdAt",
                t.updated_at AS "updatedAt",
                u.id AS "authorId",
                u.first_name AS "authorFirstName",
                u.last_name AS "authorLastName",
                u.avatar AS "authorAvatar",
                COUNT(p.id) AS "postsCount",
                MAX(p.created_at) AS "lastPostAt"
            FROM topics t
            JOIN users u ON t.author_id = u.id
            LEFT JOIN posts p ON t.id = p.topic_id
            WHERE t.forum_id = $1
            GROUP BY t.id, t.title, t.content, t.is_pinned, t.is_locked, t.views_count, t.created_at, t.updated_at, u.id, u.first_name, u.last_name, u.avatar
            ORDER BY t.is_pinned DESC, t.updated_at DESC`,
            [forumId]
        );

        res.json({
            forum: forumResult.rows[0],
            topics: topicsResult.rows
        });
    } catch (err) {
        console.error('getForumById error:', err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// Créer un nouveau topic
export const createTopicHandler = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Token manquant.' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_KEY) as { id: number, email: string };
        
        const { forumId, title, content } = req.body;

        if (!forumId || !title || !content) {
            res.status(400).json({ message: 'Tous les champs sont requis.' });
            return;
        }

        const result = await pool.query(
            `INSERT INTO topics (forum_id, author_id, title, content)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [forumId, decoded.id, title, content]
        );

        res.status(201).json({ 
            message: 'Topic créé avec succès.',
            topicId: result.rows[0].id 
        });
    } catch (err) {
        console.error('createTopic error:', err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// Récupérer un topic avec ses posts
export const getTopicByIdHandler = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const topicId = req.params.id;
    try {
        await pool.query(
            `UPDATE topics SET views_count = views_count + 1 WHERE id = $1`,
            [topicId]
        );

        const topicResult = await pool.query(
            `SELECT 
                t.id,
                t.title,
                t.content,
                t.is_pinned AS "isPinned",
                t.is_locked AS "isLocked",
                t.views_count AS "viewsCount",
                t.created_at AS "createdAt",
                t.updated_at AS "updatedAt",
                u.id AS "authorId",
                u.first_name AS "authorFirstName",
                u.last_name AS "authorLastName",
                u.avatar AS "authorAvatar",
                f.id AS "forumId",
                f.name AS "forumName"
            FROM topics t
            JOIN users u ON t.author_id = u.id
            JOIN forums f ON t.forum_id = f.id
            WHERE t.id = $1`,
            [topicId]
        );

        if (topicResult.rows.length === 0) {
            res.status(404).json({ message: 'Topic non trouvé.' });
            return;
        }

        const postsResult = await pool.query(
            `SELECT 
                p.id,
                p.content,
                p.is_solution AS "isSolution",
                p.created_at AS "createdAt",
                p.updated_at AS "updatedAt",
                u.id AS "authorId",
                u.first_name AS "authorFirstName",
                u.last_name AS "authorLastName",
                u.avatar AS "authorAvatar"
            FROM posts p
            JOIN users u ON p.author_id = u.id
            WHERE p.topic_id = $1
            ORDER BY p.created_at ASC`,
            [topicId]
        );

        res.json({
            topic: topicResult.rows[0],
            posts: postsResult.rows
        });
    } catch (err) {
        console.error('getTopicById error:', err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// Créer un nouveau post
export const createPostHandler = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Token manquant.' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_KEY) as { id: number, email: string };
        
        const { topicId, content } = req.body;

        if (!topicId || !content) {
            res.status(400).json({ message: 'Tous les champs sont requis.' });
            return;
        }

        const topicCheck = await pool.query(
            `SELECT is_locked FROM topics WHERE id = $1`,
            [topicId]
        );

        if (topicCheck.rows.length === 0) {
            res.status(404).json({ message: 'Topic non trouvé.' });
            return;
        }

        if (topicCheck.rows[0].is_locked) {
            res.status(403).json({ message: 'Ce topic est verrouillé.' });
            return;
        }

        const result = await pool.query(
            `INSERT INTO posts (topic_id, author_id, content)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [topicId, decoded.id, content]
        );

        await pool.query(
            `UPDATE topics SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [topicId]
        );

        res.status(201).json({ 
            message: 'Post créé avec succès.',
            postId: result.rows[0].id 
        });
    } catch (err) {
        console.error('createPost error:', err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
}; 