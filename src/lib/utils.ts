const storeNameMap: Record<string, string> = {
  asda: 'Asda',
  boots: 'Boots',
  marksandspencer: 'M&S',
  sainsburys: 'Sainsbury\'s',
  superdrug: 'Superdrug',
  tesco: 'Tesco',
  waitrose: 'Waitrose'
};

const currencySymbolMap: Record<string, string> = {
  GBP: '£',
  USD: '$',
  EUR: '€'
};

export function formatStoreName(storeName: string): string {
  return storeNameMap[storeName] || storeName;
}

export function getStoreNames(): string[] {
  return Object.values(storeNameMap);
}

export function getCurrencySymbol(currency: string): string {
  return currencySymbolMap[currency] || currency;
}

export function openPrivateLink(url: string): void {
  const link = document.createElement('a')
  link.href = url
  link.target = '_blank'
  link.rel = 'noopener noreferrer nofollow'
  link.referrerPolicy = 'no-referrer'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}