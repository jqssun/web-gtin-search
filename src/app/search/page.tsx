'use client';

import BarcodeScanner from '@/components/BarcodeScanner';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const router = useRouter();

  const handleScan = (gtin: string) => {
    router.push(`/gtin/${gtin}`);
  };

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <h1 className="govuk-heading-xl">Find a product</h1>
        <p className="govuk-body-l">
          View product information data using GTIN
        </p>

        <BarcodeScanner onScan={handleScan} isLoading={false} />
      </div>
    </div>
  );
}
