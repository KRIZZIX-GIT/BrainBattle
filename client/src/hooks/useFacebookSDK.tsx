import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface FacebookContextType {
  isFBReady: boolean; // Facebook SDK инициализирован
  FB?: typeof window.FB; // Ссылка на объект Facebook SDK
}

const FacebookContext = createContext<FacebookContextType | undefined>(undefined);

export function FacebookProvider({ children, appId }: { children: ReactNode; appId: string }) {
  const [isFBReady, setIsFBReady] = useState(false);

  useEffect(() => {
    const initializeFacebookSDK = () => {
      if (window.FB) {
        setIsFBReady(true);
        return;
      }

      window.fbAsyncInit = () => {
        window.FB.init({
          appId,
          autoLogAppEvents: true,
          xfbml: true,
          version: 'v17.0',
        });
        setIsFBReady(true);
      };

      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.onload = () => console.log('Facebook SDK script loaded');
      script.onerror = () => console.error('Failed to load Facebook SDK script');
      document.body.appendChild(script);
    };

    initializeFacebookSDK();
  }, [appId]);

  return (
    <FacebookContext.Provider value={{ isFBReady, FB: window.FB }}>
      {children}
    </FacebookContext.Provider>
  );
}

export function useFacebook(): FacebookContextType {
  const context = useContext(FacebookContext);
  if (context === undefined) {
    throw new Error('useFacebook must be used within a FacebookProvider');
  }
  return context;
}