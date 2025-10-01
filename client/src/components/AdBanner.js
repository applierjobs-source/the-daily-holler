import React, { useEffect } from 'react';

// Real AdSense ad components using the actual ad unit ID
export const HeaderAd = () => {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className="header-ad" style={{ margin: '10px 0', textAlign: 'center' }}>
      <ins 
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-7915880893226053"
        data-ad-slot="9347121646"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export const SidebarAd = () => {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className="sidebar-ad" style={{ margin: '20px 0', textAlign: 'center' }}>
      <ins 
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-7915880893226053"
        data-ad-slot="9347121646"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export const InContentAd = () => {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className="in-content-ad" style={{ margin: '30px auto', textAlign: 'center' }}>
      <ins 
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-7915880893226053"
        data-ad-slot="9347121646"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export const FooterAd = () => {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className="footer-ad" style={{ margin: '20px 0', textAlign: 'center' }}>
      <ins 
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-7915880893226053"
        data-ad-slot="9347121646"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export const MobileBanner = () => {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className="mobile-banner" style={{ margin: '15px 0', textAlign: 'center' }}>
      <ins 
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-7915880893226053"
        data-ad-slot="9347121646"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};
