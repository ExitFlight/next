import Script from 'next/script';

const GoogleAnalytics = () => (
  <>
    <Script
      async
      src={`https://www.googletagmanager.com/gtag/js? 
      id=G-MEWC8ENZ4S`}
    ></Script>
    <Script
      id='google-analytics'
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-MEWC8ENZ4S');
        `,
      }}
    ></Script>
  </>
);
export default GoogleAnalytics;