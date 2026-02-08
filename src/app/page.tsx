import { getStoreNames } from '@/lib/utils';
import Link from 'next/link';

export default function Home() {
  const storeNames = getStoreNames();
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <h1 className="govuk-heading-xl">GTIN Search</h1>
        <p className="govuk-body-l">
          Find product information by scanning barcodes or entering the trade item's Global Trade Item Number (GTIN).
        </p>
        <p className="govuk-body">
          Use this service to look up product details with GTIN, EAN/UPC barcodes.
        </p>
        <h2 className="govuk-heading-m govuk-!-margin-top-6">How to use this service</h2>
        <p className="govuk-body">
          You can start a search by doing one of the following:
        </p>
        <ul className="govuk-list govuk-list--bullet">
          <li>enter the GTIN found next to the barcode manually</li>
          <li>scan the barcode directly using your device camera</li>
          <li>upload an image from your device containing the barcode</li>
        </ul>
        <div className="govuk-inset-text">
          API access to this service is available for developers.
        </div>
        <p className="govuk-body">
          Provided a match is found, you will be able to see:
        </p>
        <ul className="govuk-list govuk-list--bullet">
          <li>product name, brand, categories, ingredients (if available)</li>
          <li>current online retail pricing, per unit pricing, and stock levels</li>
          <li>current promotions and loyalty offers with timing information</li>
          <li>relevant images, ratings, and customer reviews</li>
        </ul>

        <Link href="/search" className="govuk-button govuk-button--start govuk-!-margin-top-3">
          Search
          <svg className="govuk-button__start-icon" xmlns="http://www.w3.org/2000/svg" width="17.5" height="19" viewBox="0 0 33 40" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z" />
          </svg>
        </Link>

        <h2 className="govuk-heading-m govuk-!-margin-top-8">What you need to know</h2>
        <p className="govuk-body">
          GTIN numbers are used to uniquely identify trade items globally. This service is compliant with the <a className="govuk-link" href="https://www.gs1.org/standards" target="_blank" rel="noopener noreferrer">GS1 system of standards</a>.
        </p>

        <h3 className="govuk-heading-s govuk-!-margin-top-6">Data integrity notice</h3>
        <div className="govuk-inset-text">
          Product data and imagery are mirrored via publicly accessible views of third-party retailer websites. No proprietary retailer data or imagery is stored. As the service functions as a live window into external platforms, the availability or accuracy of information cannot be guaranteed. No liability is accepted for technical errors, data omissions, or incorrect pricing that originates from source websites. Final shelf-edge pricing, unit weights, and promotional terms must be duly verified on the relevant party's website before proceeding.
        </div>

        <details className="govuk-details govuk-!-margin-top-6">
          <summary className="govuk-details__summary">
            <span className="govuk-details__summary-text">
              Data coverage
            </span>
          </summary>
          <div className="govuk-details__text">
            <p className="govuk-body">
              Product information from the following retailers may be available:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              {storeNames.map((storeName) => (
                <li key={storeName}>{storeName}</li>
              ))}
            </ul>
          </div>
        </details>

        <details className="govuk-details govuk-!-margin-top-6">
          <summary className="govuk-details__summary">
            <span className="govuk-details__summary-text">
              About barcode decoding
            </span>
          </summary>
          <div className="govuk-details__text">
            Your privacy is protected. Barcode scanning and decoding happens entirely within your browser. No data is transmitted to the server.
          </div>
        </details>
      </div>
    </div>
  );
}
