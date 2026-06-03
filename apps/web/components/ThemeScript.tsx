import Script from 'next/script';

/**
 * Inline script that runs before React hydration to apply the stored theme,
 * preventing flash of wrong mode on page load.
 */
export function ThemeScript() {
  const script = `(function(){
    var t=localStorage.getItem('theme')||'system';
    if(t==='dark'){document.documentElement.setAttribute('data-theme','dark')}
    else if(t==='light'){document.documentElement.setAttribute('data-theme','light')}
    else{document.documentElement.removeAttribute('data-theme')}
  })();`;

  return (
    <Script
      id="theme-init"
      strategy="beforeInteractive"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: theme init script must run inline before React hydration
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
