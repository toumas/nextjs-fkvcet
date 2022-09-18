import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
        <Script
          src="https://www.airconsole.com/api/airconsole-1.8.0.js"
          strategy="beforeInteractive"
        ></Script>
        <Script
          src="airconsole-events.js"
          strategy="beforeInteractive"
        ></Script>
      </body>
    </Html>
  );
}
