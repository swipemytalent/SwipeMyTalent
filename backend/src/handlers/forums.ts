import { pool } from '../db/pool';
import { getEnvValue } from '../utils/getEnv';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_KEY = getEnvValue('JWT_KEY', 'JWT_KEY_FILE')!;

export const getAllForumsHandler = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    console.log('[PROD] Route /forums appelée');
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
        console.error('[PROD] Erreur route /forums :', err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

export const getForumByIdHandler = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const forumId = req.params.id;
    console.log('[PROD] Route /forums/:id appelée - getForumByIdHandler');
    console.log('[PROD] Forum ID:', forumId);
    console.log('[PROD] Headers:', JSON.stringify(req.headers, null, 2));
    
    try {
        console.log('[PROD] Tentative de récupération du forum...');
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
            console.log('[PROD] Forum non trouvé pour ID:', forumId);
            res.status(404).json({ message: 'Forum non trouvé.' });
            return;
        }

        console.log('[PROD] Forum trouvé, récupération des topics...');
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

        console.log('[PROD] Topics récupérés, nombre:', topicsResult.rows.length);
        res.json({
            forum: forumResult.rows[0],
            topics: topicsResult.rows
        });
    } catch (err) {
        console.error('[PROD] Erreur route /forums/:id - getForumByIdHandler:', err);
        console.error('[PROD] Stack trace:', err instanceof Error ? err.stack : 'Pas de stack trace');
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// Créer un nouveau topic
export const createTopicHandler = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    console.log('[PROD] Route /topics appelée - createTopicHandler');
    console.log('[PROD] Body:', JSON.stringify(req.body, null, 2));
    console.log('[PROD] Headers:', JSON.stringify(req.headers, null, 2));
    
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('[PROD] Token manquant ou invalide');
            res.status(401).json({ message: 'Token manquant.' });
            return;
        }

        const token = authHeader.split(' ')[1];
        console.log('[PROD] Tentative de vérification du token JWT...');
        const decoded = jwt.verify(token, JWT_KEY) as { id: number, email: string };
        console.log('[PROD] Token décodé, user ID:', decoded.id);
        
        const { forumId, title, content } = req.body;

        if (!forumId || !title || !content) {
            console.log('[PROD] Champs manquants:', { forumId, title: !!title, content: !!content });
            res.status(400).json({ message: 'Tous les champs sont requis.' });
            return;
        }

        console.log('[PROD] Tentative de création du topic...');
        const result = await pool.query(
            `INSERT INTO topics (forum_id, author_id, title, content)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [forumId, decoded.id, title, content]
        );

        console.log('[PROD] Topic créé avec succès, ID:', result.rows[0].id);
        res.status(201).json({ 
            message: 'Topic créé avec succès.',
            topicId: result.rows[0].id 
        });
    } catch (err) {
        console.error('[PROD] Erreur route /topics - createTopicHandler:', err);
        console.error('[PROD] Stack trace:', err instanceof Error ? err.stack : 'Pas de stack trace');
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// Récupérer un topic avec ses posts
export const getTopicByIdHandler = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const topicId = req.params.id;
    console.log('[PROD] Route /topics/:id appelée - getTopicByIdHandler');
    console.log('[PROD] Topic ID:', topicId);
    console.log('[PROD] Headers:', JSON.stringify(req.headers, null, 2));
    
    try {
        console.log('[PROD] Mise à jour du compteur de vues...');
        await pool.query(
            `UPDATE topics SET views_count = views_count + 1 WHERE id = $1`,
            [topicId]
        );

        console.log('[PROD] Récupération du topic...');
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
            console.log('[PROD] Topic non trouvé pour ID:', topicId);
            res.status(404).json({ message: 'Topic non trouvé.' });
            return;
        }

        console.log('[PROD] Topic trouvé, récupération des posts...');
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

        console.log('[PROD] Posts récupérés, nombre:', postsResult.rows.length);
        res.json({
            topic: topicResult.rows[0],
            posts: postsResult.rows
        });
    } catch (err) {
        console.error('[PROD] Erreur route /topics/:id - getTopicByIdHandler:', err);
        console.error('[PROD] Stack trace:', err instanceof Error ? err.stack : 'Pas de stack trace');
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// Créer un nouveau post
export const createPostHandler = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    console.log('[PROD] Route /posts appelée - createPostHandler');
    console.log('[PROD] Body:', JSON.stringify(req.body, null, 2));
    console.log('[PROD] Headers:', JSON.stringify(req.headers, null, 2));
    
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('[PROD] Token manquant ou invalide');
            res.status(401).json({ message: 'Token manquant.' });
            return;
        }

        const token = authHeader.split(' ')[1];
        console.log('[PROD] Tentative de vérification du token JWT...');
        const decoded = jwt.verify(token, JWT_KEY) as { id: number, email: string };
        console.log('[PROD] Token décodé, user ID:', decoded.id);
        
        const { topicId, content } = req.body;

        if (!topicId || !content) {
            console.log('[PROD] Champs manquants:', { topicId, content: !!content });
            res.status(400).json({ message: 'Tous les champs sont requis.' });
            return;
        }

        console.log('[PROD] Vérification du topic...');
        const topicCheck = await pool.query(
            `SELECT is_locked FROM topics WHERE id = $1`,
            [topicId]
        );

        if (topicCheck.rows.length === 0) {
            console.log('[PROD] Topic non trouvé pour ID:', topicId);
            res.status(404).json({ message: 'Topic non trouvé.' });
            return;
        }

        if (topicCheck.rows[0].is_locked) {
            console.log('[PROD] Topic verrouillé pour ID:', topicId);
            res.status(403).json({ message: 'Ce topic est verrouillé.' });
            return;
        }

        console.log('[PROD] Tentative de création du post...');
        const result = await pool.query(
            `INSERT INTO posts (topic_id, author_id, content)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [topicId, decoded.id, content]
        );

        console.log('[PROD] Mise à jour de la date du topic...');
        await pool.query(
            `UPDATE topics SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [topicId]
        );

        console.log('[PROD] Post créé avec succès, ID:', result.rows[0].id);
        res.status(201).json({ 
            message: 'Post créé avec succès.',
            postId: result.rows[0].id 
        });
    } catch (err) {
        console.error('[PROD] Erreur route /posts - createPostHandler:', err);
        console.error('[PROD] Stack trace:', err instanceof Error ? err.stack : 'Pas de stack trace');
        res.status(500).json({ message: 'Erreur serveur.' });
    }
}; 