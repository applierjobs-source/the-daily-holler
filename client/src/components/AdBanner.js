import React from 'react';

// Real AdSense ad components using the actual ad unit ID
export const HeaderAd = () => {
  // Let AdSense handle ad loading automatically - no manual push needed

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
  // Let AdSense handle ad loading automatically - no manual push needed

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
  // Let AdSense handle ad loading automatically - no manual push needed

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
  // Let AdSense handle ad loading automatically - no manual push needed

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
  // Let AdSense handle ad loading automatically - no manual push needed

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
  // Let AdSense handle ad loading automatically - no manual push needed

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
