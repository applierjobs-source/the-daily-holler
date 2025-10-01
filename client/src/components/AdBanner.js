import React from 'react';

// Simple ad placeholder components that will work with auto ads
export const HeaderAd = () => (
  <div className="header-ad" style={{ 
    margin: '10px 0', 
    minHeight: '90px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px'
  }}>
    <div style={{ color: '#666', fontSize: '14px' }}>
      Advertisement
    </div>
  </div>
);

export const SidebarAd = () => (
  <div className="sidebar-ad" style={{ 
    margin: '20px 0', 
    minHeight: '250px',
    width: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px'
  }}>
    <div style={{ color: '#666', fontSize: '14px' }}>
      Advertisement
    </div>
  </div>
);

export const InContentAd = () => (
  <div className="in-content-ad" style={{ 
    margin: '30px auto', 
    minHeight: '250px',
    width: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px'
  }}>
    <div style={{ color: '#666', fontSize: '14px' }}>
      Advertisement
    </div>
  </div>
);

export const FooterAd = () => (
  <div className="footer-ad" style={{ 
    margin: '20px 0', 
    minHeight: '90px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px'
  }}>
    <div style={{ color: '#666', fontSize: '14px' }}>
      Advertisement
    </div>
  </div>
);

export const MobileBanner = () => (
  <div className="mobile-banner" style={{ 
    margin: '15px 0', 
    minHeight: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px'
  }}>
    <div style={{ color: '#666', fontSize: '14px' }}>
      Advertisement
    </div>
  </div>
);
