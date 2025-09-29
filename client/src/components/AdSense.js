import React, { useEffect } from 'react';

const AdSense = ({ 
  slot, 
  style = { display: 'block' }, 
  format = 'auto', 
  responsive = true,
  className = '',
  adType = 'banner'
}) => {
  useEffect(() => {
    try {
      // Check if adsbygoogle is available
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  // Different ad sizes based on type
  const getAdStyle = () => {
    const baseStyle = {
      display: 'block',
      margin: '20px auto',
      textAlign: 'center',
      ...style
    };

    switch (adType) {
      case 'banner':
        return {
          ...baseStyle,
          width: '728px',
          height: '90px'
        };
      case 'rectangle':
        return {
          ...baseStyle,
          width: '300px',
          height: '250px'
        };
      case 'leaderboard':
        return {
          ...baseStyle,
          width: '728px',
          height: '90px'
        };
      case 'mobile-banner':
        return {
          ...baseStyle,
          width: '320px',
          height: '50px'
        };
      default:
        return baseStyle;
    }
  };

  if (!slot) {
    return (
      <div className={`ad-placeholder ${className}`} style={getAdStyle()}>
        <div style={{
          border: '2px dashed #ccc',
          padding: '20px',
          textAlign: 'center',
          color: '#666',
          backgroundColor: '#f9f9f9'
        }}>
          Ad Space - Slot: {slot || 'Not configured'}
        </div>
      </div>
    );
  }

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={getAdStyle()}
        data-ad-client="ca-pub-XXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};

export default AdSense;
