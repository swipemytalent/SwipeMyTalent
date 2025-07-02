import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import ProfileCard from '../components/cards/ProfileCard';
import { fetchUsers } from '../api/userApi';
import { AuthService } from '../services/authService';
import { LoggerService } from '../services/loggerService';
import '../styles/talents.scss';
import type { UserState } from '../redux/userSlice';

type User = UserState;

const Talents: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 9;
  const currentUser = useSelector((state: RootState) => state.user);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        if (!AuthService.isLoggedIn()) return;

        const data = await fetchUsers();
        const filteredUsers = data.filter((user: User) => user.id !== currentUser.id);
        setUsers(filteredUsers);
      } catch (error) {
        LoggerService.error('Erreur lors de la récupération des utilisateurs', error);
      }
    };

    fetchUsersData();
  }, [currentUser.id]);

  const filteredUsers = users.filter(user => {
    const q = search.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(q) ||
      user.lastName?.toLowerCase().includes(q) ||
      user.title?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const usersToShow = filteredUsers.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="talents">
      <div className="talents__header">
        <h1>
          <span className="logo-blue">Découvrez</span>
          <span className="logo-orange"> les talents</span>
        </h1>
      </div>
      <div className="talents__searchbar">
        <input
          type="text"
          placeholder="Rechercher un talent..."
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
        />
      </div>
      <div className="talents__grid">
        {usersToShow.map((user) => (
          <ProfileCard
            key={user.id}
            user={user}
            isViewOnly={true}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="talents__pagination">
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
            Précédent
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={currentPage === i + 1 ? 'active' : ''}
              onClick={() => goToPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default Talents; 