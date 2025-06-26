import { useState } from 'react';
import EditBioModal from '../EditBioModal';
import SeeMoreModal from './SeeMoreModal';
import '../../styles/AboutCard.scss';

const AboutCard = () => {
  const [bio, setBio] = useState<string>(
    ""
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [voirPlusModal, setVoirPlusModal] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleSaveBio = (newBio: string) => {
    setBio(newBio);
    setIsModalOpen(false);
  };

  function formatBioToHtml(bio: string) {
    const lines = bio.split('\n');
    let html = '';
    let inList = false;
    lines.forEach(line => {
      if (line.trim().startsWith('-')) {
        if (!inList) {
          html += '<ul>';
          inList = true;
        }
        html += `<li>${line.replace(/^\s*-\s*/, '')}</li>`;
      } else {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        if (line.trim() !== '') {
          html += `<p>${line}</p>`;
        }
      }
    });
    if (inList) html += '</ul>';
    return html;
  }

  const isLong = bio.length > 480;
  const bioAffiche = isLong ? bio.slice(0, 480) + "..." : bio;

  return (
    <section className="dashboard__card about-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>À propos</h2>
        <button onClick={handleOpenModal} className="edit-btn">Modifier</button>
      </div>
      <div className="about-card__content">
        <div dangerouslySetInnerHTML={{ __html: formatBioToHtml(bioAffiche) }} />
        {isLong && (
          <button
            onClick={() => setVoirPlusModal(true)}
            style={{
              color: "#007bff",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              font: "inherit"
            }}
          >
            Voir plus
          </button>
        )}
      </div>
      {voirPlusModal && (
        <SeeMoreModal
          isOpen={voirPlusModal}
          onClose={() => setVoirPlusModal(false)}
          htmlContent={formatBioToHtml(bio)}
        />
      )}
      {isModalOpen && (
        <EditBioModal isOpen={isModalOpen} currentBio={bio} onClose={handleCloseModal} onSave={handleSaveBio} />
      )}
    </section>
  );
};

export default AboutCard; 