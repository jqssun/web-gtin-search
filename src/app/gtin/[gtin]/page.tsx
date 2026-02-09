'use client';

import BarcodeScanner from '@/components/BarcodeScanner';
import ProductDetails from '@/components/ProductDetails';
import { getProductByGTIN } from '@/lib/api';
import { GTINResponse } from '@/lib/types';
import JsBarcode from 'jsbarcode';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface PageProps {
  params: Promise<{ gtin: string }>;
}

export default function GTINPage({ params }: PageProps) {
  const router = useRouter();
  const [gtin, setGtin] = useState<string>('');
  const [products, setProducts] = useState<GTINResponse>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const barcodeRef = useRef<SVGSVGElement>(null);

  const handleScan = async (newGtin: string) => {
    if (newGtin === gtin) {
      return;
    }
    router.push(`/gtin/${newGtin}`);
  };

  const fetchProductData = async (gtinToFetch: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getProductByGTIN(gtinToFetch);
      setProducts(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch information');
      setProducts({});
    } finally {
      setLoading(false);
    }
  };

  const handleRescan = () => {
    fetchProductData(gtin);
  };

  const handleCopyUrl = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  // Generate barcode when GTIN changes
  useEffect(() => {
    if (gtin && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, gtin, {
          format: "EAN13",
          width: 2,
          height: 60,
          displayValue: false,
          margin: 10,
          background: "#f8fafc", // Light blue background to match the container
          lineColor: "#1e40af" // Blue color to match the theme
        });
      } catch (err) {
        console.error('Failed to generate barcode:', err);
        // Try with a more generic format if EAN13 fails
        try {
          JsBarcode(barcodeRef.current, gtin, {
            format: "CODE128",
            width: 2,
            height: 60,
            displayValue: false,
            margin: 10,
            background: "#f8fafc",
            lineColor: "#1e40af"
          });
        } catch (err2) {
          console.error('Failed to generate barcode with CODE128:', err2);
        }
      }
    }
  }, [gtin]);

  useEffect(() => {
    params.then(({ gtin: gtinParam }) => {
      setGtin(gtinParam);
      if (gtinParam) {
        document.title = `${gtinParam} - Search GTIN`;
        fetchProductData(gtinParam);
      }
    });
  }, [params]);

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <Link href="/" className="govuk-back-link">
          Back
        </Link>

        <BarcodeScanner onScan={handleScan} isLoading={loading} />

        {gtin && (
          <div className="govuk-!-margin-top-4">
            <div className="govuk-notification-banner" role="region" aria-labelledby="gtin-banner-title">
              <div className="govuk-notification-banner__header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 className="govuk-notification-banner__title" id="gtin-banner-title">
                  GTIN
                </h2>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    window.print();
                  }}
                  className="govuk-notification-banner__title govuk-link"
                  style={{ color: '#ffffff', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Print
                </a>
              </div>
              <div className="govuk-notification-banner__content" style={{ position: 'relative', padding: 0, display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '15px 0', maxWidth: 'none' }}>
                  <svg
                    ref={barcodeRef}
                    style={{ maxWidth: '100%', height: 'auto', marginBottom: '10px' }}
                  ></svg>
                  <p className="govuk-body" style={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: 0 }}>
                    {gtin}
                  </p>
                </div>

                <div style={{ position: 'absolute', top: '50%', right: '15px', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={handleCopyUrl}
                    className="govuk-button govuk-button--secondary"
                    title="Copy page URL to clipboard"
                    style={{ marginBottom: 0 }}
                    data-module="govuk-button"
                  >
                    Share
                  </button>

                  <p className="govuk-body-s" style={{ color: '#00703c', marginBottom: 0, minHeight: '20px', visibility: copySuccess ? 'visible' : 'hidden' }}>
                    Copied
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="govuk-!-margin-top-6" style={{ textAlign: 'center', padding: '40px 0' }}>
            <p className="govuk-body" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Loading...</p>
            <p className="govuk-body-s" style={{ color: '#505a5f' }}>Fetching product information</p>
          </div>
        )}

        {error && (
          <div className="govuk-error-summary govuk-!-margin-top-6" aria-labelledby="error-summary-title" role="alert" data-module="govuk-error-summary">
            <h2 className="govuk-error-summary__title" id="error-summary-title">
              There is a problem
            </h2>
            <div className="govuk-error-summary__body">
              <p className="govuk-body">{error}</p>
              {gtin && (
                <button
                  className="govuk-button govuk-button--secondary govuk-!-margin-top-3"
                  onClick={handleRescan}
                  disabled={loading}
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        )}

        {Object.keys(products).length > 0 && (
          <ProductDetails products={products} />
        )}

        {!loading && !error && Object.keys(products).length === 0 && gtin && (
          <div className="govuk-!-margin-top-6" style={{ textAlign: 'center', padding: '40px 0' }}>
            <p className="govuk-body">
              No products found for GTIN: {gtin}
            </p>
            <button
              className="govuk-button govuk-!-margin-top-4"
              onClick={handleRescan}
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}