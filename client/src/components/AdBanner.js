import React, { useEffect } from 'react';

// Real AdSense ad components using the actual ad unit ID
export const HeaderAd = () => {
  useEffect(() => {
    try {
      console.log('HeaderAd: Attempting to load ad...');
      console.log('AdSense script available:', !!window.adsbygoogle);
      
      if (window.adsbygoogle) {
        console.log('HeaderAd: Pushing ad to AdSense...');
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        console.log('HeaderAd: Ad pushed successfully');
      } else {
        console.warn('HeaderAd: AdSense script not loaded yet');
      }
    } catch (err) {
      console.error('HeaderAd: AdSense error:', err);
    }
  }, []);

  return (
    <div className="header-ad" style={{ margin: '10px 0', textAlign: 'center' }}>
      <ins 
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '90px', backgroundColor: '#f0f0f0', border: '1px dashed #ccc' }}
        data-ad-client="ca-pub-7915880893226053"
        data-ad-slot="9347121646"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
        Ad Space (Slot: 9347121646)
      </div>
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

// In-article ad component with the specific ad unit
export const InArticleAd = () => {
  useEffect(() => {
    try {
      console.log('InArticleAd: Attempting to load ad...');
      console.log('AdSense script available:', !!window.adsbygoogle);
      
      if (window.adsbygoogle) {
        console.log('InArticleAd: Pushing ad to AdSense...');
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        console.log('InArticleAd: Ad pushed successfully');
      } else {
        console.warn('InArticleAd: AdSense script not loaded yet');
      }
    } catch (err) {
      console.error('InArticleAd: AdSense error:', err);
    }
  }, []);

  return (
    <div className="in-article-ad" style={{ margin: '30px auto', textAlign: 'center' }}>
      <ins 
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center', minHeight: '90px', backgroundColor: '#f0f0f0', border: '1px dashed #ccc' }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-7915880893226053"
        data-ad-slot="1468631620"
      />
      <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
        In-Article Ad (Slot: 1468631620)
      </div>
    </div>
  );
};
