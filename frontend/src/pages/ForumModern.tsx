import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { fetchForums, fetchForumById, clearCurrentForum } from '../redux/forumSlice';
import './ForumModern.scss';

const ForumModern: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  useSelector((state: RootState) => state.forum);
  const [selectedForumId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchForums());
  }, [dispatch]);

  useEffect(() => {
    if (selectedForumId !== null) {
      dispatch(fetchForumById(selectedForumId));
    } else {
      dispatch(clearCurrentForum());
    }
  }, [dispatch, selectedForumId]);


  return (
    <div className="forum-layout">
      <main className="forum-main">
        <div className="forum-main__empty">
          <h2>Forum désactivé</h2>
          <p>La liste des forums n'est plus disponible.</p>
        </div>
      </main>
    </div>
  );
};

export default ForumModern; 