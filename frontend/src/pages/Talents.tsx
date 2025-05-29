import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import ProfileCard from '../components/ProfileCard';
import '../styles/talents.scss';
import type { UserState } from '../redux/userSlice';

type User = UserState;

const Talents: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const currentUser = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/users', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Erreur lors de la récupération des utilisateurs');
        
        const data = await response.json();
        const filteredUsers = data.filter((user: User) => user.id !== currentUser.id);
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchUsers();
  }, [currentUser.id]);

  return (
    <div className="talents">
      <div className="talents__header">
        <h1>
          <span className="logo-blue">Découvrez</span>
          <span className="logo-orange"> les talents</span>
        </h1>
      </div>
      <div className="talents__grid">
        {users.map((user) => (
          <ProfileCard
            key={user.id}
            user={user}
            isViewOnly={true}
          />
        ))}
      </div>
    </div>
  );
};

export default Talents; 