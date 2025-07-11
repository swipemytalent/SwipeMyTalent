import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import {
  fetchForums,
  fetchForumById,
  fetchTopicById,
  clearCurrentForum,
  clearCurrentTopic,
  createNewTopic,
  createNewPost
} from '../redux/forumSlice';
import './ForumDiscord.scss';

const ForumDiscord: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { forums, currentForum, currentTopic, loading, error } = useSelector((state: RootState) => state.forum);
  const [selectedForumId, setSelectedForumId] = useState<number | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [creatingTopic, setCreatingTopic] = useState(false);
  const [topicError, setTopicError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchForums());
  }, [dispatch]);

  useEffect(() => {
    if (selectedForumId !== null) {
      dispatch(fetchForumById(selectedForumId));
      setSelectedTopicId(null);
      dispatch(clearCurrentTopic());
    } else {
      dispatch(clearCurrentForum());
      setSelectedTopicId(null);
      dispatch(clearCurrentTopic());
    }
  }, [dispatch, selectedForumId]);

  useEffect(() => {
    if (selectedTopicId !== null) {
      dispatch(fetchTopicById(selectedTopicId));
    } else {
      dispatch(clearCurrentTopic());
    }
  }, [dispatch, selectedTopicId]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForumId || !newTopicTitle.trim() || !newTopicContent.trim()) {
      setTopicError('Titre et contenu obligatoires');
      return;
    }
    setCreatingTopic(true);
    setTopicError(null);
    try {
      await dispatch(createNewTopic({
        forumId: selectedForumId,
        title: newTopicTitle,
        content: newTopicContent
      })).unwrap();
      setShowNewTopicForm(false);
      setNewTopicTitle('');
      setNewTopicContent('');
      dispatch(fetchForumById(selectedForumId));
    } catch (err: any) {
      setTopicError(err?.message || 'Erreur lors de la création du topic');
    } finally {
      setCreatingTopic(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopicId || !newMessage.trim()) {
      setMessageError('Message obligatoire');
      return;
    }
    setSendingMessage(true);
    setMessageError(null);
    try {
      await dispatch(createNewPost({
        topicId: selectedTopicId,
        content: newMessage
      })).unwrap();
      setNewMessage('');
      dispatch(fetchTopicById(selectedTopicId));
    } catch (err: any) {
      setMessageError(err?.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="forum-discord-layout">
      <aside className="forum-discord-sidebar">
        <div className="forum-discord-sidebar__title">Forums</div>
        {loading && <div className="forum-discord-sidebar__loading">Chargement...</div>}
        {error && <div className="forum-discord-sidebar__error">Erreur: {error}</div>}
        {forums.map((forum) => (
          <div
            key={forum.id}
            className={`forum-discord-sidebar__item${selectedForumId === forum.id ? ' active' : ''}`}
            onClick={() => setSelectedForumId(forum.id)}
          >
            <div className="forum-discord-sidebar__item-title">{forum.name}</div>
            <div className="forum-discord-sidebar__item-desc">{forum.description}</div>
          </div>
        ))}
      </aside>
      <section className="forum-discord-topics">
        {selectedForumId === null ? (
          <div className="forum-discord-empty">Sélectionnez un forum</div>
        ) : loading ? (
          <div className="forum-discord-loading">Chargement des topics...</div>
        ) : error ? (
          <div className="forum-discord-error">Erreur: {error}</div>
        ) : currentForum ? (
          <>
            <div className="forum-discord-topics__header">
              {currentForum.forum.name}
              <button
                className="btn btn--primary forum-discord-topics__new-btn"
                onClick={() => setShowNewTopicForm((v) => !v)}
              >
                {showNewTopicForm ? 'Annuler' : 'Nouveau topic'}
              </button>
            </div>
            {showNewTopicForm && (
              <form className="forum-discord-topics__new-form" onSubmit={handleCreateTopic}>
                <input
                  type="text"
                  placeholder="Titre du topic"
                  value={newTopicTitle}
                  onChange={e => setNewTopicTitle(e.target.value)}
                  className="forum-discord-topics__input"
                  disabled={creatingTopic}
                  required
                />
                <textarea
                  placeholder="Contenu du topic"
                  value={newTopicContent}
                  onChange={e => setNewTopicContent(e.target.value)}
                  className="forum-discord-topics__textarea"
                  rows={4}
                  disabled={creatingTopic}
                  required
                />
                {topicError && <div className="forum-discord-topics__error">{topicError}</div>}
                <button type="submit" className="btn btn--primary" disabled={creatingTopic}>
                  {creatingTopic ? 'Création...' : 'Créer le topic'}
                </button>
              </form>
            )}
            <div className="forum-discord-topics__list">
              {currentForum.topics.length === 0 ? (
                <div className="forum-discord-empty">Aucun topic</div>
              ) : (
                currentForum.topics.map((topic) => (
                  <div
                    key={topic.id}
                    className={`forum-discord-topics__item${selectedTopicId === topic.id ? ' active' : ''}${topic.isPinned ? ' pinned' : ''}`}
                    onClick={() => setSelectedTopicId(topic.id)}
                  >
                    <div className="forum-discord-topics__item-title">{topic.title}</div>
                    <div className="forum-discord-topics__item-meta">
                      <span>{topic.postsCount} messages</span>
                      {topic.isPinned && <span className="forum-discord-badge pinned">Épinglé</span>}
                      {topic.isLocked && <span className="forum-discord-badge locked">Verrouillé</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : null}
      </section>
      <main className="forum-discord-messages">
        {selectedTopicId === null ? (
          <div className="forum-discord-empty">Sélectionnez un topic</div>
        ) : loading ? (
          <div className="forum-discord-loading">Chargement des messages...</div>
        ) : error ? (
          <div className="forum-discord-error">Erreur: {error}</div>
        ) : currentTopic ? (
          <>
            <div className="forum-discord-messages__header">{currentTopic.topic.title}</div>
            <div className="forum-discord-messages__list">
              <div className="forum-discord-message original">
                <div className="forum-discord-message__author">
                  <span className="avatar-placeholder">
                    {currentTopic.topic.authorFirstName[0]}{currentTopic.topic.authorLastName[0]}
                  </span>
                  <span className="author-name">{currentTopic.topic.authorFirstName} {currentTopic.topic.authorLastName}</span>
                  <span className="date">{new Date(currentTopic.topic.createdAt).toLocaleString('fr-FR')}</span>
                </div>
                <div className="forum-discord-message__content">
                  {currentTopic.topic.content}
                </div>
              </div>
              {currentTopic.posts.map((post) => (
                <div key={post.id} className={`forum-discord-message${post.isSolution ? ' solution' : ''}`}>
                  <div className="forum-discord-message__author">
                    <span className="avatar-placeholder">
                      {post.authorFirstName[0]}{post.authorLastName[0]}
                    </span>
                    <span className="author-name">{post.authorFirstName} {post.authorLastName}</span>
                    <span className="date">{new Date(post.createdAt).toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="forum-discord-message__content">
                    {post.content}
                  </div>
                  {post.isSolution && (
                    <div className="forum-discord-badge solution">Solution</div>
                  )}
                </div>
              ))}
            </div>
            <form className="forum-discord-message-form" onSubmit={handleSendMessage}>
              <textarea
                className="forum-discord-message-form__textarea"
                placeholder="Votre message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                rows={2}
                disabled={sendingMessage}
                required
              />
              {messageError && <div className="forum-discord-message-form__error">{messageError}</div>}
              <button type="submit" className="btn btn--primary" disabled={sendingMessage || !newMessage.trim()}>
                {sendingMessage ? 'Envoi...' : 'Envoyer'}
              </button>
            </form>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default ForumDiscord; 