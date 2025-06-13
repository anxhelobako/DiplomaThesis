import React, { useState, useEffect } from 'react';
import CarPhotos from './CarPhotos';
import { customArticles } from '../data/articles';


/* ------------------------------------------------------------------ */
/*  GLOBAL CSS (mounted once)                                         */
/* ------------------------------------------------------------------ */
const injectOnce = (() => {
  let done = false;
  return () => {
    if (done) return;
    done = true;
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeInUp {
        0% { opacity: 0; transform: translateY(20px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 0.8; }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes particle {
        0% { transform: translateY(0px) scale(0); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: translateY(-100vh) scale(1); opacity: 0; }
      }
      .card-hover {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .card-hover:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(139, 92, 246, 0.3);
      }
      .btn-glow {
        transition: all 0.3s ease;
      }
      .btn-glow:hover {
        box-shadow: 0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3);
        transform: translateY(-2px);
      }
      .glass {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .gradient-text {
        background: linear-gradient(90deg, #ffffff 0%, #a5f3fc 25%, #c084fc 75%, #ffffff 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .gradient-bg {
        background: linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%);
      }
      .particle {
        position: absolute;
        width: 2px;
        height: 2px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        animation: particle 6s infinite linear;
      }
      body, html {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }
      .news-modal-image {
          width: 100%;
          max-height: 400px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .news-modal-content {
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.8);
        }

        .news-modal-content p {
          margin-bottom: 1.5rem;
        }

        .news-modal-meta {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .news-modal-link {
          color: #06b6d4;
          text-decoration: none;
          display: inline-block;
          margin-top: 1rem;
        }
        .news-modal-link:hover {
          text-decoration: underline;
        }
        @keyframes fadeIn {
         from { opacity: 0; }
         to { opacity: 1; }
        }
        @keyframes spin {
         0% { transform: rotate(0deg); }
         100% { transform: rotate(360deg); }
}
    `;
    document.head.appendChild(style);
  };
})();

/* ------------------------------------------------------------------ */
/*  INLINE STYLE OBJECTS                                              */
/* ------------------------------------------------------------------ */
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #581c87 30%, #1e1b4b 70%, #0f172a 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundOrb1: {
    position: 'absolute',
    top: '-10rem',
    right: '-10rem',
    width: '20rem',
    height: '20rem',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(40px)',
    animation: 'pulse 4s ease-in-out infinite',
  },
  backgroundOrb2: {
    position: 'absolute',
    bottom: '-10rem',
    left: '-10rem',
    width: '24rem',
    height: '24rem',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(40px)',
    animation: 'pulse 4s ease-in-out infinite 1s',
  },
  backgroundOrb3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '16rem',
    height: '16rem',
    background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(40px)',
    animation: 'pulse 4s ease-in-out infinite 0.5s',
  },
  content: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '3rem 1.5rem',
  },
  heroSection: {
    textAlign: 'center',
    marginBottom: '4rem',
    animation: 'fadeInUp 0.8s ease-out',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    padding: '0.75rem 1.5rem',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(16px)',
    borderRadius: '50px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 500,
  },
  heroTitle: {
    fontSize: '4rem',
    fontWeight: 900,
    marginBottom: '1.5rem',
    background: 'linear-gradient(90deg, #ffffff 0%, #3fd9e5 25%, #d2a4fd 75%, #ffffff 100%)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    lineHeight: 1.1,
  },
  heroSubtitle: {
    fontSize: '2.5rem',
    fontWeight: 900,
    marginTop: '0.5rem',
    background: 'linear-gradient(90deg, #d2a4fd 0%, #3fd9e5 100%)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  },
  heroDescription: {
    fontSize: '1.25rem',
    color: 'rgba(255, 255, 255, 0.7)',
    maxWidth: '32rem',
    margin: '0 auto',
    lineHeight: 1.6,
  },
  section: {
    marginBottom: '4rem',
  },
  sectionCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(16px)',
    borderRadius: '1.5rem',
    padding: '2rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    transition: 'all 0.5s ease',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '2rem',
  },
  sectionIcon: {
    width: '3rem',
    height: '3rem',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  sectionTitle: {
    fontSize: '1.875rem',
    fontWeight: 700,
    color: 'white',
    margin: 0,
  },
  newsItem: {
    padding: '1.5rem',
    borderRadius: '1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    marginBottom: '1.5rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  newsTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: 'white',
    marginBottom: '0.5rem',
    margin: 0,
  },
  newsDescription: {
    color: 'rgba(255, 255, 255, 0.6)',
    margin: 0,
    lineHeight: 1.6,
  },
  carsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  },
  carCard: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    backdropFilter: 'blur(8px)',
    borderRadius: '1rem',
    padding: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  carBadge: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    padding: '0.25rem 0.75rem',
    background: 'rgba(34, 197, 94, 0.2)',
    color: '#86efac',
    fontSize: '0.75rem',
    fontWeight: 600,
    borderRadius: '50px',
    border: '1px solid rgba(34, 197, 94, 0.3)',
  },
  carImage: {
    height: '8rem',
    marginBottom: '1.5rem',
    background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  carImageOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.2) 0%, transparent 100%)',
  },
  carMake: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'white',
    margin: 0,
    marginBottom: '0.25rem',
  },
  carModel: {
    fontSize: '1.125rem',
    color: '#c084fc',
    fontWeight: 600,
    margin: 0,
  },
  carDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.75rem',
    marginBottom: '1.5rem',
  },
  carYear: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  carPrice: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#06b6d4',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  button: {
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
  },
  primaryButton: {
    flex: 1,
    background: 'linear-gradient(90deg, #8b5cf6 0%, #06b6d4 100%)',
    color: 'white',
  },
  secondaryButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
  },
  dangerButton: {
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#fca5a5',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '0.75rem',
    color: 'white',
    marginBottom: '1rem',
    fontSize: '0.875rem',
  },
  inputGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem',
  },
  tipsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  tipCard: {
    height: '100%',
    padding: '1.5rem',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    backdropFilter: 'blur(8px)',
    borderRadius: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    cursor: 'pointer',
  },
  tipHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  tipIcon: {
    flexShrink: 0,
    width: '3rem',
    height: '3rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: 'white',
    margin: 0,
    marginBottom: '0.5rem',
  },
  tipDescription: {
    color: 'rgba(255, 255, 255, 0.6)',
    margin: 0,
    lineHeight: 1.6,
  },
  authSection: {
    background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
    backdropFilter: 'blur(16px)',
    borderRadius: '1.5rem',
    padding: '2rem',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    textAlign: 'center',
  },
  authTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'white',
    marginBottom: '1rem',
  },
  authDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '1.5rem',
    fontSize: '1.125rem',
  },
  authButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  authButton: {
    padding: '1rem 2rem',
    borderRadius: '0.75rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '1rem',
    transition: 'all 0.3s ease',
  },
  primaryAuthButton: {
    background: 'linear-gradient(90deg, #8b5cf6 0%, #06b6d4 100%)',
    color: 'white',
  },
  secondaryAuthButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  loadingState: {
    textAlign: 'center',
    padding: '2rem',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  loadingSkeleton: {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    animation: 'pulse 2s infinite',
  },
  modalOverlay: {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.9)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  opacity: 0,
  animation: 'fadeIn 0.3s ease-out forwards',
},
modalContainer: {
  width: '100%',
  maxWidth: '800px',
  maxHeight: '90vh',
  overflowY: 'auto',
  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(88, 28, 135, 0.95) 100%)',
  borderRadius: '1rem',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  willChange: 'transform', // Improves animation performance
  backfaceVisibility: 'hidden', // Prevents visual glitches
  transform: 'translateZ(0)', // Hardware acceleration
},
modalCloseButton: {
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  background: 'rgba(255, 255, 255, 0.1)',
  border: 'none',
  borderRadius: '50%',
  width: '2.5rem',
  height: '2.5rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: 'white',
  fontSize: '1.5rem',
  zIndex: 10,
},
modalImage: {
  width: '100%',
  height: '300px',
  objectFit: 'cover',
  borderTopLeftRadius: '1rem',
  borderTopRightRadius: '1rem',
},
modalContent: {
  padding: '2rem',
},
modalMeta: {
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
  marginBottom: '1rem',
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '0.9rem',
},
modalSource: {
  color: '#c084fc',
  fontWeight: 600,
},
modalDate: {
  color: 'rgba(255, 255, 255, 0.5)',
},
modalTitle: {
  fontSize: '1.8rem',
  fontWeight: 700,
  color: 'white',
  marginBottom: '1.5rem',
  lineHeight: 1.2,
},
modalBody: {
  color: 'rgba(255, 255, 255, 0.8)',
  lineHeight: 1.6,
},
modalDescription: {
  fontSize: '1.1rem',
  marginBottom: '1.5rem',
  fontWeight: 500,
},
modalFullContent: {
  marginTop: '1.5rem',
},
modalParagraph: {
  marginBottom: '1rem',
},
modalFooter: {
  marginTop: '2rem',
  paddingTop: '1rem',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: '0.9rem',
  fontStyle: 'italic',
},
imageContainer: {
  width: '100%',
  height: '300px',
  backgroundColor: '#1e293b',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderTopLeftRadius: '1rem',
  borderTopRightRadius: '1rem',
  overflow: 'hidden'
},
loadingState: {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  color: 'rgba(255, 255, 255, 0.7)'
},
loadingSpinner: {
  width: '50px',
  height: '50px',
  border: '4px solid rgba(255, 255, 255, 0.1)',
  borderTop: '4px solid #8b5cf6',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  marginBottom: '1rem'
},
readMoreLink: {
  display: 'inline-block',
  marginTop: '2rem',
  padding: '0.75rem 1.5rem',
  backgroundColor: 'rgba(139, 92, 246, 0.2)',
  color: '#c084fc',
  borderRadius: '0.5rem',
  textDecoration: 'none',
  fontWeight: '600',
  transition: 'all 0.3s ease',
  ':hover': {
    backgroundColor: 'rgba(139, 92, 246, 0.4)'
  }
},
loadingContainer: {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '200px',
  backgroundColor: 'rgba(30, 41, 59, 0.5)',
  borderRadius: '0.5rem',
  marginBottom: '1rem'
},
loadingSpinner: {
  width: '40px',
  height: '40px',
  border: '4px solid rgba(139, 92, 246, 0.2)',
  borderTop: '4px solid #8b5cf6',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
},
loadingSkeleton: {
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '4px',
  animation: 'pulse 2s infinite',
  opacity: 0.7
},
};

// Icons as simple SVG components
const CarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.4 10c-.4-.8-1.2-1.3-2.1-1.3H7.7c-.9 0-1.7.5-2.1 1.3L3.5 11.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="7" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
    <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
  </svg>
);


const TrendingUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="17,6 23,6 23,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LeafIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 8c0 8-6 14-6 14s-6-6-6-14a6 6 0 0 1 12 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 21l8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ZapIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Home component                                                     */
/* ------------------------------------------------------------------ */
// Fallback image SVG for news articles (must be defined outside the component for global access)
const fallbackImageSVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'>
  <rect width='600' height='400' fill='%231e293b'/>
  <text x='50%' y='50%' fill='%23c084fc' font-family='sans-serif' font-size='24' text-anchor='middle' dominant-baseline='middle'>No Image Available</text>
</svg>`;

const staticNews = [
  {
    id: 1,
    title: "Rivian R2's Advanced Suspension System Revealed",
    description: "New details emerge about the innovative suspension in Rivian's upcoming R2 model",
    url: "https://www.autoblog.com/news/rivian-r2-advanced-suspension",
    image: "https://www.autoblog.com/.image/w_1080,q_auto:good,c_fill,ar_4:3/NzowMDAwMDAwMDAwOTAxNzEx/240228_eric_anderson_2880x1920_14_kpqmza.jpg",
    publishedAt: new Date().toISOString(),
    source: "Autoblog",
    content: "Full article content here for Rivian R2 suspension..."
  },
  {
    id: 2,
    title: "German Cars Decline in Popularity Among Enthusiasts",
    description: "Analysis shows shifting preferences in car enthusiast searches worldwide",
    url: "https://www.autoblog.com/news/german-cars-out-whats-behind-a-big-shift-in-car-enthusiast-searches",
    image: "https://www.autoblog.com/.image/w_1080,q_auto:good,c_fill,ar_4:3/NzowMDAwMDAwMDAwOTAzNzI0/porsche-963-rsp-18.jpg",
    publishedAt: new Date().toISOString(),
    source: "Autoblog",
    content: "Full article content about German cars..."
  },
  {
    id: 3,
    title: "Chevrolet Just Stole Ford’s #2 EV Crown in America",
    description: "The number 2 EV brand in America has officially been replaced.",
    url: "https://www.autoblog.com/news/chevrolet-surpasses-ford-for-number-2-ev-spot",
    image: "https://www.autoblog.com/.image/w_1080,q_auto:good,c_fill,ar_4:3/NzowMDAwMDAwMDAwODgxNzM2/2025-equinox-reveal-gallery-ext-19.jpg",
    publishedAt: "2024-06-10T12:00:00Z",
    source: "Your Car Blog",
    content: "Detailed article ..."
  },
  {
    id: 4,
    title: "Audi’s Smallest Crossover Is Ready To Hit The Big Leagues",
    description: "The next-generation Audi Q3 is finally about to be revealed.",
    url: "https://www.autoblog.com/news/audis-smallest-crossover-is-ready-to-hit-the-big-leagues",
    image: "https://www.autoblog.com/.image/w_1080,q_auto:good,c_fill,ar_4:3/NzowMDAwMDAwMDAwOTA0OTQz/a-first-look-at-the-new-audi-q3-904943.jpg",
    publishedAt: "2024-06-08T15:00:00Z",
    source: "Your Car Blog",
    content: "Full article ..."
  },
  {
    id: 5,
    title: "New BMW 5 Series Delayed, But It Will Be Worth The Wait",
    description: "According to a reliable source, the G60 facelift will happen months later than initally planned.",
    url: "https://www.autoblog.com/news/new-bmw-5-series-delayed-but-it-will-be-worth-the-wait",
    image: "https://www.autoblog.com/.image/w_1080,q_auto:good,c_fill,ar_4:3/NzowMDAwMDAwMDAwOTA0NDU4/p90523159_highres_the-bmw-i5-m60-xdriv-904458.jpg",
    publishedAt: "2024-06-05T10:00:00Z",
    source: "Your Car Blog",
    content: "Details ..."
  },
  {
    id: 6,
    title: "Ford Sales Soar: Which Models are Driving the Trend",
    description: "Ford had quite an impressive first five months of the year, with a handful of models driving the sales boost.",
    url: "https://www.autoblog.com/news/ford-sales-soar-may-2025",
    image: "https://www.autoblog.com/.image/w_1080,q_auto:good,c_fill,ar_4:3/MjEzMDkyNDkwMDg4MDMyMDkz/2025-bronco-sport_04-880325-880325.jpg",
    publishedAt: "2024-06-01T08:00:00Z",
    source: "Your Car Blog",
    content: "Details ..."
  },
  {
    id: 7,
    title: "Apple CarPlay Updates: What’s New for iOS 26?",
    description: "The tech giant hosted its annual WWDC in Cupertino, revealing updates to the CarPlay that go with the new iOS 26.",
    url: "https://www.autoblog.com/news/apple-carplay-updates-whats-new-for-ios-26",
    image: "https://www.autoblog.com/.image/w_1080,q_auto:good,c_fill,ar_4:3/NzowMDAwMDAwMDAwOTA0ODQ4/apple-carplay-updates-ios-26-01.jpg",
    publishedAt: "2024-05-30T09:00:00Z",
    source: "Your Car Blog",
    content: "Event schedule and highlights ..."
  },
  {
    id: 8,
    title: "Mazda Issues Recall for 2025 CX-30 and Mazda3 Models",
    description: "Mazda recalls 13,000 vehicles due to issues with the driver monitoring camera.",
    url: "https://www.autoblog.com/news/mazda-cx-30-mazda3-safety-recall-2025",
    image: "https://www.autoblog.com/.image/w_1080,q_auto:good,c_fill,ar_4:3/MjA5MTMwOTI2MDczMTI4NTYw/2020-mazda-cx-30-la-08.jpg",
    publishedAt: "2024-06-10T17:00:00Z",
    source: "Autoblog",
    content: "Mazda has issued a safety recall over driver-monitoring camera issues in 2025 Mazda3 and CX-30 models..."
  },
  {
    id: 9,
    title: "Alfa Romeo Teases New Stelvio in Shadowy Preview",
    description: "New image hints at a sleeker, more aggressive design for the upcoming Alfa Romeo Stelvio.",
    url: "https://www.autoblog.com/news/alfa-romeo-teaser-new-stelvio",
    image: "https://www.autoblog.com/.image/w_1080,q_auto:good,c_fill,ar_4:3/NzowMDAwMDAwMDAwOTA0MDQw/alfa-romeo-june-10-2025-teaser-904040.png",
    publishedAt: "2024-06-11T12:00:00Z",
    source: "Autoblog",
    content: "Alfa Romeo has teased its next Stelvio model with a darkened image revealing a sporty new silhouette..."
  }
];

const Home = ({ user = null }) => {
  injectOnce();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [news, setNews] = React.useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [editingCarId, setEditingCarId] = useState(null);
  const [editForm, setEditForm] = useState({ make: '', model: '', year: '', price: '' });
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [fullArticleContent, setFullArticleContent] = useState('');
  const [loadingFullArticle, setLoadingFullArticle] = useState(false);

  // Mock data for demonstration
React.useEffect(() => {
    // Instead of fetching from backend, just set static news
    setNews(staticNews);

    // mock cars data
    const timeoutId = setTimeout(() => {
      setCars([
        { id: 1, make: "Tesla", model: "Model S Plaid", year: 2024, price: 89990, type: "Electric" }
      ]);
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timeoutId);
  }, []);

const handleArticleClick = async (article) => {
  setSelectedArticle(article);
  setLoadingFullArticle(article.content || article.description || "Content not available");
  
  try {
    // For local articles with content
    if (article.content) {
      setFullArticleContent(article.content);
      return;
    }

    // For articles without URLs
    if (!article.url || article.url === '#') {
      setFullArticleContent(article.description || "Full content not available");
      return;
    }

    console.log('Fetching article content for:', article.url);
    const response = await fetch(`/api/news/article?url=${encodeURIComponent(article.url)}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setFullArticleContent(data.content || article.description || "Content unavailable");
    
  } catch (error) {
    console.error("Article content fetch failed:", error);
    setFullArticleContent(article.description || "Error loading content");
  } finally {
    setLoadingFullArticle(false);
  }
};


  const ecoDrivingTips = [
    { 
      id: 1, 
      title: 'Regenerative Braking', 
      description: 'Maximize energy recovery by using regenerative braking systems in electric and hybrid vehicles.',
      icon: <ZapIcon />
    },
    { 
      id: 2, 
      title: 'Eco Mode Optimization', 
      description: 'Activate eco-driving modes to automatically optimize performance for maximum efficiency.',
      icon: <LeafIcon />
    },
    { 
      id: 3, 
      title: 'Smart Route Planning', 
      description: 'Use AI-powered navigation to find the most fuel-efficient routes and avoid traffic congestion.',
      icon: <TrendingUpIcon />
    },
    { 
      id: 4, 
      title: 'Energy Monitoring', 
      description: 'Monitor real-time energy consumption and adjust driving habits for optimal efficiency.',
      icon: <ZapIcon />
    },
  ];

  const createParticles = () => {
    return [...Array(20)].map((_, i) => (
      <div
        key={i}
        className="particle"
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 6}s`,
          animationDuration: `${4 + Math.random() * 4}s`
        }}
      />
    ));
  };

  return (
    <div style={styles.container}>
      {/* Background Effects */}
      <div style={styles.backgroundOrb1} />
      <div style={styles.backgroundOrb2} />
      <div style={styles.backgroundOrb3} />
      {createParticles()}

      <div style={styles.content}>
        {/* Hero Section */}
        <div style={styles.heroSection}>
          <div style={styles.heroBadge}>
            <CarIcon />
            <span>Premium Car Experience</span>
          </div>
          <h1 style={styles.heroTitle}>
            Car Finder
            <div style={styles.heroSubtitle}>Future Ready</div>
          </h1>
          <p style={styles.heroDescription}>
            Discover tomorrow's vehicles today. Experience the ultimate in automotive innovation with our curated collection of premium cars.
          </p>
        </div>

        {/* News Section */}
      <div style={styles.section}>
        <div style={styles.sectionCard} className="card-hover">
          <div style={styles.sectionHeader}>
            <div style={{...styles.sectionIcon, background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)' }}>
              <TrendingUpIcon />
            </div>
            <h2 style={styles.sectionTitle}>Latest Updates</h2>
          </div>
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {news.map(article => (
              <div 
                key={article.id} 
                style={styles.newsItem} 
                className="card-hover" 
                onClick={() => handleArticleClick(article)}
              >
                {/* Article Image */}
                <div style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#1e293b',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <img
                    src={article.image}
                    alt={article.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = fallbackImageSVG;
                      e.target.style.objectFit = 'contain';
                      e.target.style.padding = '1rem';
                    }}
                  />
                </div>
                {/* Title */}
                <h3 style={styles.newsTitle}>{article.title}</h3>
                {/* Description */}
                <p style={styles.newsDescription}>
                  {article.description.length > 100 ? `${article.description.substring(0, 100)}...` : article.description}
                </p>
                {/* Source & Date */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    color: '#c084fc', 
                    fontSize: '0.8rem',
                    background: 'rgba(139, 92, 246, 0.1)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px'
                  }}>
                    {article.source || 'Your Car Blog'}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                    {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Optionally show full article content below when selected */}
          {selectedArticle && (
            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#0f172a', borderRadius: '0.5rem' }}>
              <h3>{selectedArticle.title}</h3>
              {loadingFullArticle ? (
                <p>Loading article...</p>
              ) : (
                <p>{fullArticleContent}</p>
              )}
            </div>
          )}
        </div>
</div>

        {/* Eco-Driving Tips Section */}
        <div style={styles.section}>
          <div style={styles.sectionCard} className="card-hover">
            <div style={styles.sectionHeader}>
              <div style={{...styles.sectionIcon, background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' }}>
                <LeafIcon />
              </div>
              <h2 style={styles.sectionTitle}>Eco-Driving Tips</h2>
            </div>
            <div style={styles.tipsGrid}>
              {ecoDrivingTips.map(tip => (
                <div key={tip.id} style={styles.tipCard}>
                  <div style={styles.tipHeader}>
                    <div style={styles.tipIcon}>{tip.icon}</div>
                    <div style={styles.tipContent}>
                      <h3 style={styles.tipTitle}>{tip.title}</h3>
                      <p style={styles.tipDescription}>{tip.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

         {/* Car Gallery Section */}
        <div style={styles.section}>
          <CarPhotos style={styles.sectionCard} />
        </div>

        {/* Authentication Section */}
        {!user && (
          <div style={styles.authSection}>
            <h2 style={styles.authTitle}>Join Us!</h2>
            <p style={styles.authDescription}>Create an account to save your favorite cars and access exclusive features.</p>
            <div style={styles.authButtons}>
              <button style={{...styles.authButton, ...styles.primaryAuthButton}}>Sign Up</button>
              <button style={{...styles.authButton, ...styles.secondaryAuthButton}}>Log In</button>
            </div>
          </div>
        )}
      </div>
 {selectedArticle && (
  <div style={styles.modalOverlay} onClick={() => setSelectedArticle(null)}>
    <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
      <button 
        style={styles.modalCloseButton}
        onClick={() => setSelectedArticle(null)}
        className="btn-glow"
      >
        ×
      </button>
      
      {/* Image with better error handling */}
      <div style={styles.imageContainer}>
        <img
          src={selectedArticle.image}
          alt={selectedArticle.title}
          style={styles.modalImage}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImageSVG;
            e.target.style.objectFit = 'contain';
            e.target.style.padding = '2rem';
            e.target.style.backgroundColor = '#1e293b';
          }}
        />
      </div>
      
      <div style={styles.modalContent}>
        <div style={styles.modalMeta}>
          <span style={{
            ...styles.modalSource,
            background: 'rgba(139, 92, 246, 0.1)',
            padding: '0.25rem 0.75rem',
            borderRadius: '4px'
          }}>
            {selectedArticle.source}
          </span>
          <span style={styles.modalDate}>
            {new Date(selectedArticle.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
        
        <h2 style={styles.modalTitle}>{selectedArticle.title}</h2>
        
        {loadingFullArticle ? (
          <div style={styles.loadingState}>
            <div style={styles.loadingSpinner} />
            <p>Loading article content...</p>
          </div>
        ) : (
          <div style={styles.modalBody}>
            <p style={{
              ...styles.modalDescription,
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1.1rem',
              lineHeight: '1.8'
            }}>
              {selectedArticle.description}
            </p>
            {fullArticleContent && (
              <div style={styles.modalFullContent}>
                {fullArticleContent.split('\n\n').map((paragraph, i) => (
                  <p key={i} style={{
                    ...styles.modalParagraph,
                    marginBottom: '1.5rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    lineHeight: '1.8'
                  }}>
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
        
        {selectedArticle.url && selectedArticle.url !== '#' && (
          <div style={{ marginTop: '2rem' }}>
            <a
              href={selectedArticle.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...styles.readMoreLink,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
              className="btn-glow"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              Read on {selectedArticle.source}
            </a>
          </div>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
};
export default Home;