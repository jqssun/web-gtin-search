import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "GTIN Search",
  description: "View product information data using GTIN",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="govuk-template">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0b0c0c" />
        <link rel="stylesheet" href="/govuk-frontend.min.css" />
        <link rel="icon" sizes="48x48" href="/assets/images/favicon.ico" />
        <link rel="icon" sizes="any" href="/assets/images/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/assets/manifest.json" />
      </head>
      <body className="govuk-template__body">
        <Script id="govuk-body-start" strategy="beforeInteractive">
          {`document.body.className += ' js-enabled' + ('noModule' in HTMLScriptElement.prototype ? ' govuk-frontend-supported' : '');`}
        </Script>

        <a href="#main-content" className="govuk-skip-link" data-module="govuk-skip-link">
          Skip to main content
        </a>

        <header className="govuk-header" role="banner" data-module="govuk-header">
          <div className="govuk-header__container govuk-width-container">
            <div className="govuk-header__content" style={{ paddingLeft: 0 }}>
              <Link href="/" className="govuk-header__link govuk-header__service-name">
                GTIN Search
              </Link>
            </div>
          </div>
        </header>

        <div className="govuk-width-container">
          <div className="govuk-phase-banner" role="complementary">
            <p className="govuk-phase-banner__content">
              <strong className="govuk-tag govuk-phase-banner__content__tag">
                Beta
              </strong>
              <span className="govuk-phase-banner__text">
                This is a new service – your <a className="govuk-link" href="https://github.com/jqssun/web-gtin-search" target="_blank">feedback</a> will help us to improve it.
              </span>
            </p>
          </div>
          <main className="govuk-main-wrapper" id="main-content" role="main">
            {children}
          </main>
        </div>

        <footer className="govuk-footer" role="contentinfo">
          <div className="govuk-width-container">
            <div className="govuk-footer__meta">
              <div className="govuk-footer__meta-item govuk-footer__meta-item--grow">
                <h2 className="govuk-visually-hidden">Support links</h2>
                <ul className="govuk-footer__inline-list">
                  <li className="govuk-footer__inline-list-item">
                    <a className="govuk-footer__link" href="/">
                      Help
                    </a>
                  </li>
                  <li className="govuk-footer__inline-list-item">
                    <a className="govuk-footer__link" href="https://github.com/jqssun/web-gtin-search">
                      Project
                    </a>
                  </li>
                </ul>

                This project is an independent research tool designed to enhance price transparency. The methodology is aligned with the <a className="govuk-footer__link" href="https://www.gov.uk/government/publications/price-transparency-cma209" target="_blank" rel="noopener noreferrer">CMA's Price Transparency Guidance (CMA209)</a> and the <a className="govuk-footer__link" href="https://www.legislation.gov.uk/ukpga/2024" target="_blank" rel="noopener noreferrer">Digital Markets, Competition and Consumers Act 2024 (DMCCA)</a>. Retail and unit pricing information is used to assist consumers in making informed decisions, envisioned by the <a className="govuk-footer__link" href="https://www.legislation.gov.uk/uksi/2004/102/contents" target="_blank" rel="noopener noreferrer">Price Marking Order 2004 (amended 2026)</a> and <a className="govuk-footer__link" href="https://www.legislation.gov.uk/uksi/2008/1277/contents" target="_blank" rel="noopener noreferrer">Consumer Protection from Unfair Trading Regulations 2008 (CPRs)</a>.

                <br /><br />
                This public service is free and open source. Barcode scanner based on <a className="govuk-footer__link" href="https://github.com/zxing-js/library" target="_blank" rel="noopener noreferrer">ZXing ("zebra crossing")</a>. Font is <a className="govuk-footer__link" href="https://www.k-type.com/fonts/transport-new/" target="_blank" rel="noopener noreferrer">Transport New</a>.

                <span className="govuk-footer__licence-description">
                  Site design using the {" "}
                  <a
                    className="govuk-footer__link"
                    href="https://github.com/alphagov/govuk-frontend"
                  >
                    GOV.UK Design System
                  </a>
                  , under the terms of the {" "}
                  <a
                    className="govuk-footer__link"
                    href="https://github.com/alphagov/govuk-frontend/blob/main/LICENSE.txt"
                  >
                    MIT License
                  </a>
                  .
                </span>
              </div>
              <div className="govuk-footer__meta-item">
                <a
                  className="govuk-footer__link govuk-footer__copyright-logo"
                  href="https://github.com/jqssun"
                >
                  © jqssun
                </a>
              </div>
            </div>
          </div>
        </footer>

        <Script src="/govuk-frontend.min.js" strategy="afterInteractive" />
        <Script id="govuk-init" strategy="afterInteractive">
          {`
            if (window.GOVUKFrontend) {
              window.GOVUKFrontend.initAll();
            }
          `}
        </Script>
      </body>
    </html>
  );
}
