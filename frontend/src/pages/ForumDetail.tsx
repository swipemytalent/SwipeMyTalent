import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../redux/store';
import { fetchForumById, createNewTopic } from '../redux/forumSlice';
import './ForumDetail.scss';

const ForumDetail: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  const { currentForum, loading, error } = useSelector((state: RootState) => state.forum);
  
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [newTopicData, setNewTopicData] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchForumById(parseInt(id)));
    }
  }, [dispatch, id]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newTopicData.title || !newTopicData.content) return;

    try {
      await dispatch(createNewTopic({
        forumId: parseInt(id),
        title: newTopicData.title,
        content: newTopicData.content
      })).unwrap();
      
      setNewTopicData({ title: '', content: '' });
      setShowNewTopicForm(false);
      dispatch(fetchForumById(parseInt(id)));
    } catch (error) {
      console.error('Erreur lors de la création du topic:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="forum-detail-container">
        <div className="loading">Chargement du forum...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="forum-detail-container">
        <div className="error">Erreur: {error}</div>
      </div>
    );
  }

  if (!currentForum) {
    return (
      <div className="forum-detail-container">
        <div className="error">Forum non trouvé</div>
      </div>
    );
  }

  return (
    <div className="forum-detail-container">
      <div className="forum-header">
        <div className="breadcrumb">
          <Link to="/forum">Forum</Link> &gt; {currentForum.forum.name}
        </div>
        <h1>{currentForum.forum.name}</h1>
        <p>{currentForum.forum.description}</p>
        <button 
          className="btn-primary"
          onClick={() => setShowNewTopicForm(!showNewTopicForm)}
        >
          {showNewTopicForm ? 'Annuler' : 'Nouveau Topic'}
        </button>
      </div>

      {showNewTopicForm && (
        <div className="new-topic-form">
          <h3>Créer un nouveau topic</h3>
          <form onSubmit={handleCreateTopic}>
            <div className="form-group">
              <label htmlFor="title">Titre</label>
              <input
                type="text"
                id="title"
                value={newTopicData.title}
                onChange={(e) => setNewTopicData({...newTopicData, title: e.target.value})}
                placeholder="Titre de votre topic"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="content">Contenu</label>
              <textarea
                id="content"
                value={newTopicData.content}
                onChange={(e) => setNewTopicData({...newTopicData, content: e.target.value})}
                placeholder="Contenu de votre topic"
                rows={6}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Créer le topic
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="topics-list">
        {currentForum.topics.length === 0 ? (
          <div className="no-topics">
            <p>Aucun topic dans ce forum pour le moment.</p>
            <p>Soyez le premier à créer un topic !</p>
          </div>
        ) : (
          currentForum.topics.map((topic) => (
            <div key={topic.id} className={`topic-card ${topic.isPinned ? 'pinned' : ''}`}>
              <div className="topic-info">
                <div className="topic-header">
                  <h3>
                    <Link to={`/topic/${topic.id}`}>{topic.title}</Link>
                    {topic.isPinned && <span className="pin-badge">Épinglé</span>}
                    {topic.isLocked && <span className="lock-badge">Verrouillé</span>}
                  </h3>
                </div>
                <div className="topic-meta">
                  <span>Par {topic.authorFirstName} {topic.authorLastName}</span>
                  <span>{formatDate(topic.createdAt)}</span>
                </div>
              </div>
              <div className="topic-stats">
                <div className="stat">
                  <span className="label">Vues</span>
                  <span className="value">{topic.viewsCount}</span>
                </div>
                <div className="stat">
                  <span className="label">Messages</span>
                  <span className="value">{topic.postsCount}</span>
                </div>
                {topic.lastPostAt && (
                  <div className="stat">
                    <span className="label">Dernier message</span>
                    <span className="value">{formatDate(topic.lastPostAt)}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ForumDetail; 