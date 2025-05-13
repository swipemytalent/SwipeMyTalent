import React, { useRef } from 'react';

const ProfileForm = ({ user, onChange, onPhotoChange, onSubmit }) => {
  const fileInputRef = useRef();

  return (
    <form className="profile-form" onSubmit={e => { e.preventDefault(); onSubmit && onSubmit(); }}>
      <div className="profile-form__group profile-form__avatar-group">
        <label htmlFor="avatar">Photo de profil</label>
        <div className="profile-form__avatar-preview" onClick={() => fileInputRef.current.click()}>
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" />
          ) : (
            <span className="profile-form__avatar-placeholder">+</span>
          )}
        </div>
        <input
          type="file"
          id="avatar"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={onPhotoChange}
        />
      </div>
      <div className="profile-form__group">
        <label htmlFor="firstName">Prénom</label>
        <input type="text" id="firstName" name="firstName" value={user?.firstName || ''} onChange={onChange} />
      </div>
      <div className="profile-form__group">
        <label htmlFor="lastName">Nom</label>
        <input type="text" id="lastName" name="lastName" value={user?.lastName || ''} onChange={onChange} />
      </div>
      <div className="profile-form__group">
        <label htmlFor="title">Métier</label>
        <input type="text" id="title" name="title" value={user?.title || ''} onChange={onChange} />
      </div>
      <button type="submit" className="btn btn--primary">Enregistrer</button>
    </form>
  );
};

export default ProfileForm; 