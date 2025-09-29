import React from 'react';
import AdSense from './AdSense';

// Header banner ad
export const HeaderAd = () => (
  <AdSense 
    slot="1234567890" // Replace with your actual ad slot
    adType="leaderboard"
    className="header-ad"
    style={{ margin: '10px 0' }}
  />
);

// Sidebar ad
export const SidebarAd = () => (
  <AdSense 
    slot="1234567891" // Replace with your actual ad slot
    adType="rectangle"
    className="sidebar-ad"
    style={{ margin: '20px 0' }}
  />
);

// In-content ad (between paragraphs)
export const InContentAd = () => (
  <AdSense 
    slot="1234567892" // Replace with your actual ad slot
    adType="rectangle"
    className="in-content-ad"
    style={{ margin: '30px auto' }}
  />
);

// Footer ad
export const FooterAd = () => (
  <AdSense 
    slot="1234567893" // Replace with your actual ad slot
    adType="banner"
    className="footer-ad"
    style={{ margin: '20px 0' }}
  />
);

// Mobile banner (responsive)
export const MobileBanner = () => (
  <AdSense 
    slot="1234567894" // Replace with your actual ad slot
    adType="mobile-banner"
    className="mobile-banner"
    style={{ margin: '15px 0' }}
  />
);
