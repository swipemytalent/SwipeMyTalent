import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../redux/store';
import { fetchTopicById, createNewPost } from '../redux/forumSlice';
import './TopicDetail.scss';

const TopicDetail: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  const { currentTopic, loading, error } = useSelector((state: RootState) => state.forum);
  
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchTopicById(parseInt(id)));
    }
  }, [dispatch, id]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newPostContent.trim()) return;

    try {
      await dispatch(createNewPost({
        topicId: parseInt(id),
        content: newPostContent
      })).unwrap();
      
      setNewPostContent('');
      setShowNewPostForm(false);
      // Recharger le topic pour afficher le nouveau post
      dispatch(fetchTopicById(parseInt(id)));
    } catch (error) {
      console.error('Erreur lors de la création du post:', error);
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
      <div className="topic-detail-container">
        <div className="loading">Chargement du topic...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="topic-detail-container">
        <div className="error">Erreur: {error}</div>
      </div>
    );
  }

  if (!currentTopic) {
    return (
      <div className="topic-detail-container">
        <div className="error">Topic non trouvé</div>
      </div>
    );
  }

  return (
    <div className="topic-detail-container">
      <div className="topic-header">
        <div className="breadcrumb">
          <Link to="/forum">Forum</Link> &gt; 
          <Link to={`/forum/${currentTopic.topic.forumId}`}>{currentTopic.topic.forumName}</Link> &gt; 
          {currentTopic.topic.title}
        </div>
        <h1>{currentTopic.topic.title}</h1>
        <div className="topic-meta">
          <span>Par {currentTopic.topic.authorFirstName} {currentTopic.topic.authorLastName}</span>
          <span>{formatDate(currentTopic.topic.createdAt)}</span>
          <span>{currentTopic.topic.viewsCount} vues</span>
          {currentTopic.topic.isPinned && <span className="pin-badge">Épinglé</span>}
          {currentTopic.topic.isLocked && <span className="lock-badge">Verrouillé</span>}
        </div>
      </div>

      <div className="topic-content">
        <div className="post original-post">
          <div className="post-author">
            <div className="author-avatar">
              {currentTopic.topic.authorAvatar ? (
                <img src={currentTopic.topic.authorAvatar} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {currentTopic.topic.authorFirstName[0]}{currentTopic.topic.authorLastName[0]}
                </div>
              )}
            </div>
            <div className="author-info">
              <div className="author-name">
                {currentTopic.topic.authorFirstName} {currentTopic.topic.authorLastName}
              </div>
              <div className="post-date">
                {formatDate(currentTopic.topic.createdAt)}
              </div>
            </div>
          </div>
          <div className="post-content">
            {currentTopic.topic.content}
          </div>
        </div>

        {currentTopic.posts.map((post) => (
          <div key={post.id} className={`post ${post.isSolution ? 'solution' : ''}`}>
            <div className="post-author">
              <div className="author-avatar">
                {post.authorAvatar ? (
                  <img src={post.authorAvatar} alt="Avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    {post.authorFirstName[0]}{post.authorLastName[0]}
                  </div>
                )}
              </div>
              <div className="author-info">
                <div className="author-name">
                  {post.authorFirstName} {post.authorLastName}
                </div>
                <div className="post-date">
                  {formatDate(post.createdAt)}
                </div>
              </div>
            </div>
            <div className="post-content">
              {post.content}
            </div>
            {post.isSolution && (
              <div className="solution-badge">
                ✓ Solution acceptée
              </div>
            )}
          </div>
        ))}
      </div>

      {!currentTopic.topic.isLocked && (
        <div className="new-post-section">
          <button 
            className="btn-primary"
            onClick={() => setShowNewPostForm(!showNewPostForm)}
          >
            {showNewPostForm ? 'Annuler' : 'Répondre'}
          </button>

          {showNewPostForm && (
            <div className="new-post-form">
              <h3>Ajouter une réponse</h3>
              <form onSubmit={handleCreatePost}>
                <div className="form-group">
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Votre réponse..."
                    rows={6}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Publier la réponse
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {currentTopic.topic.isLocked && (
        <div className="locked-message">
          <p>Ce topic est verrouillé. Aucune nouvelle réponse n'est autorisée.</p>
        </div>
      )}
    </div>
  );
};

export default TopicDetail; 