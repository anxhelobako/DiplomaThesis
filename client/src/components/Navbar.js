import React from 'react';
import { Link } from 'react-router-dom';

/* ------------------------------------------------------------------ */
/*  GLOBAL CSS (mounted once) - Matching Home.js                     */
/* ------------------------------------------------------------------ */
const injectNavbarStyles = (() => {
  let done = false;
  return () => {
    if (done) return;
    done = true;
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes navGlow {
        0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
        50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.5), 0 0 40px rgba(6, 182, 212, 0.3); }
      }
      @keyframes navSlideIn {
        0% { opacity: 0; transform: translateY(-20px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .nav-link-hover {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
      }
      .nav-link-hover:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
      }
      .nav-link-hover::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s ease;
      }
      .nav-link-hover:hover::before {
        left: 100%;
      }
      .nav-glass {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .nav-gradient-text {
        background: linear-gradient(90deg, #ffffff 0%, #a5f3fc 50%, #c084fc 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
    `;
    document.head.appendChild(style);
  };
})();

/* ------------------------------------------------------------------ */
/*  INLINE STYLE OBJECTS - Matching Home.js patterns                 */
/* ------------------------------------------------------------------ */
const navStyles = {
  navbarContainer: {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(88, 28, 135, 0.95) 50%, rgba(15, 23, 42, 0.95) 100%)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    animation: 'navSlideIn 0.6s ease-out',
  },
  navContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '1rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logoIcon: {
    width: '2.5rem',
    height: '2.5rem',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: 900,
    background: 'linear-gradient(90deg, #ffffff 0%, #a5f3fc 50%, #c084fc 100%)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    textDecoration: 'none',
  },
  mainNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  navLink: {
    padding: '0.75rem 1.25rem',
    borderRadius: '0.75rem',
    color: 'rgba(255, 255, 255, 0.9)',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
  },
  activeNavLink: {
    background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.3) 0%, rgba(6, 182, 212, 0.3) 100%)',
    border: '1px solid rgba(139, 92, 246, 0.5)',
    color: 'white',
    boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
  },
  authSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  authButton: {
    padding: '0.75rem 1.5rem',
    borderRadius: '0.75rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  primaryAuthButton: {
    background: 'linear-gradient(90deg, #8b5cf6 0%, #06b6d4 100%)',
    color: 'white',
    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
  },
  secondaryAuthButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userAvatar: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 700,
    fontSize: '1rem',
    border: '2px solid rgba(255, 255, 255, 0.2)',
  },
  userName: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: 600,
  },
  divider: {
    width: '1px',
    height: '1.5rem',
    background: 'rgba(255, 255, 255, 0.2)',
    margin: '0 0.5rem',
  },
  mobileMenuButton: {
    display: 'none',
    padding: '0.5rem',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '0.5rem',
    color: 'white',
    cursor: 'pointer',
  },
  // Responsive styles would typically be handled with CSS media queries
  // but for this inline approach, we'll use JavaScript for mobile detection
};

// Icons matching Home.js style
const CarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.4 10c-.4-.8-1.2-1.3-2.1-1.3H7.7c-.9 0-1.7.5-2.1 1.3L3.5 11.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="7" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
    <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const DashboardIcon = () => (
  <svg width="16" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="9" stroke="currentColor" strokeWidth="2"/>
    <rect x="14" y="3" width="7" height="5" stroke="currentColor" strokeWidth="2"/>
    <rect x="14" y="12" width="7" height="9" stroke="currentColor" strokeWidth="2"/>
    <rect x="3" y="16" width="7" height="5" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Navbar component                                                   */
/* ------------------------------------------------------------------ */
const Navbar = ({ user, setUser, refreshSession }) => {
  injectNavbarStyles();

  // Get current path to highlight active nav item
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  const isActive = (path) => currentPath === path;

  const getUserInitials = (user) => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav style={navStyles.navbarContainer}>
      <div style={navStyles.navContent}>
        {/* Logo Section */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={navStyles.logoSection}>
            <div style={navStyles.logoIcon}>
              <CarIcon />
            </div>
            <span style={{...navStyles.logoText, color: '#ffffff', textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'}}>Car Finder</span>
          </div>
        </Link>

        {/* Main Navigation */}
        <div style={navStyles.mainNav}>
          <div style={navStyles.navLinks}>
            <Link 
              to="/" 
              style={{
                ...navStyles.navLink,
                ...(isActive('/') ? navStyles.activeNavLink : {})
              }}
              className="nav-link-hover"
            >
              Home
            </Link>
            
            <div style={navStyles.divider} />
            
           

            {user && (
              <>
                <div style={navStyles.divider} />
                <Link 
                  to="/dashboard" 
                  style={{
                    ...navStyles.navLink,
                    ...(isActive('/dashboard') ? navStyles.activeNavLink : {})
                  }}
                  className="nav-link-hover"
                >
                  <DashboardIcon />
                  Dashboard
                </Link>
              </>
            )}
          </div>

          {/* Authentication Section */}
          <div style={navStyles.authSection}>
            {user ? (
              <div style={navStyles.userInfo}>
                <div style={navStyles.userAvatar}>
                  {getUserInitials(user)}
                </div>
                <span style={navStyles.userName}>
                  Welcome, {user.name || 'User'}
                </span>
              </div>
            ) : (
              <>
                <Link 
                  to="/register" 
                  style={{
                    ...navStyles.authButton,
                    ...navStyles.secondaryAuthButton
                  }}
                  className="nav-link-hover"
                >
                  <UserIcon />
                  Register
                </Link>
                <Link 
                  to="/login" 
                  style={{
                    ...navStyles.authButton,
                    ...navStyles.primaryAuthButton
                  }}
                  className="nav-link-hover"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;