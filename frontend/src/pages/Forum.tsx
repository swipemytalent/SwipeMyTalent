import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { fetchForums } from '../redux/forumSlice';
import './Forum.scss';

const Forum: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.forum);

  useEffect(() => {
    dispatch(fetchForums());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="forum-container">
        <div className="loading">Chargement des forums...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="forum-container">
        <div className="error">Erreur: {error}</div>
      </div>
    );
  }

  return (
    <div className="forum-container">
      <div className="forum-header">
        <h1>Forum Communautaire</h1>
        <p>Partagez vos expériences et posez vos questions à la communauté SwipeMyTalent</p>
      </div>
    </div>
  );
};

export default Forum; 