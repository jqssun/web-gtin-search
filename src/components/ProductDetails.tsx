'use client';

import { ProductData, Promotion } from '@/lib/types';
import { formatStoreName, getCurrencySymbol, openPrivateLink } from '@/lib/utils';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface ProductDetailsProps {
  products: Record<string, ProductData>;
}

export default function ProductDetails({ products }: ProductDetailsProps) {
  const productEntries = Object.entries(products);
  const [selectedImage, setSelectedImage] = useState<Record<string, number>>({});
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);
  const scrollContainerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [scrollPositions, setScrollPositions] = useState<Record<string, { atStart: boolean; atEnd: boolean }>>({});
  const [showUpdatedTime, setShowUpdatedTime] = useState(true);
  const [showNoStock, setShowNoStock] = useState(true);
  const [showPromotions, setShowPromotions] = useState(true);

  const getValidImages = (images: string[] | undefined) => {
    const filtered = images?.filter(img => img && img.trim() !== '') || [];
    return filtered.reverse();
  };

  const formatDate = (timestamp: number) => {
    if (timestamp <= 0) return null;
    return new Date(timestamp * 1000).toLocaleDateString(navigator.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPromoText = (text: string) => {
    return text.replace(/_/g, ' ').toUpperCase();
  };

  const formatPrice = (price: number, currency: string) => {
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${price.toFixed(2)}`;
  };

  const updateScrollPosition = (store: string, container: HTMLDivElement) => {
    const atStart = container.scrollLeft <= 0;
    const atEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;
    setScrollPositions(prev => ({ ...prev, [store]: { atStart, atEnd } }));
  };

  useEffect(() => {
    Object.entries(scrollContainerRefs.current).forEach(([store, container]) => {
      if (container) {
        updateScrollPosition(store, container);
      }
    });
  }, [productEntries.length]);

  const handleShare = async (storeName: string, productName: string) => {
    try {
      const url = `${window.location.origin}${window.location.pathname}#${storeName}`;

      if (navigator.share) {
        await navigator.share({
          title: `${productName} - ${formatStoreName(storeName)}`,
          text: `Check out this product from ${formatStoreName(storeName)}`,
          url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        setShareSuccess(storeName);
        setTimeout(() => setShareSuccess(null), 2000);
      }
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  const renderPromotion = (promo: string | Promotion, index: number, currency: string) => {
    if (typeof promo === 'string') {
      return (
        <div key={index} className="govuk-inset-text" style={{ backgroundColor: '#d5e8d4', borderLeft: '5px solid #00703c', padding: '12px', margin: 0 }}>
          <span className="govuk-body-s">{promo}</span>
        </div>
      );
    }

    return (
      <div key={index} className="govuk-inset-text" style={{ backgroundColor: '#d5e8d4', borderLeft: '5px solid #00703c', padding: '12px', margin: 0 }}>
        {promo.name && (
          <h5 className="govuk-heading-s" style={{ color: '#00703c', marginBottom: '10px' }}>
            {promo.url ? (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openPrivateLink(promo.url!);
                }}
                className="govuk-link"
                style={{ color: '#00703c', textDecoration: 'underline' }}
              >
                {formatPromoText(promo.name)}
              </a>
            ) : (
              formatPromoText(promo.name)
            )}
          </h5>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {promo.base && (
            <p className="govuk-body-s" style={{ marginBottom: 0 }}>
              <span style={{ fontWeight: 'bold', color: '#00703c' }}>Base: </span>
              <span style={{ color: '#005a30' }}>{formatPromoText(promo.base)}</span>
            </p>
          )}

          {promo.loyalty && (
            <p className="govuk-body-s" style={{ marginBottom: 0 }}>
              <span style={{ fontWeight: 'bold', color: '#00703c' }}>Loyalty: </span>
              <span style={{ color: '#005a30' }}>{formatPromoText(promo.loyalty)}</span>
            </p>
          )}

          {((promo.start && promo.start > 0) || (promo.end && promo.end > 0)) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
              {(promo.start && promo.start > 0) && (
                <p className="govuk-body-s" style={{ marginBottom: 0 }}>
                  <span style={{ fontWeight: 'bold', color: '#00703c' }}>Start: </span>
                  <span style={{ color: '#005a30' }}>{formatDate(promo.start)}</span>
                </p>
              )}

              {(promo.end && promo.end > 0) && (
                <p className="govuk-body-s" style={{ marginBottom: 0 }}>
                  <span style={{ fontWeight: 'bold', color: '#00703c' }}>End: </span>
                  <span style={{ color: '#005a30' }}>{formatDate(promo.end)}</span>
                </p>
              )}
            </div>
          )}

          {(promo.old_price && promo.old_price > 0) || (promo.new_price && promo.new_price > 0) ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', paddingTop: '10px', marginTop: '5px', borderTop: '1px solid #00703c' }}>
              {promo.old_price && promo.old_price > 0 && (
                <p className="govuk-body-s" style={{ marginBottom: 0 }}>
                  <span style={{ fontWeight: 'bold', color: '#00703c' }}>Before: </span>
                  <span style={{ fontWeight: 'bold', color: '#005a30' }}>{formatPrice(promo.old_price, currency)}</span>
                </p>
              )}
              {promo.new_price && promo.new_price > 0 && (
                <p className="govuk-body-s" style={{ marginBottom: 0 }}>
                  <span style={{ fontWeight: 'bold', color: '#00703c' }}>Current: </span>
                  <span style={{ fontWeight: 'bold', color: '#005a30' }}>{formatPrice(promo.new_price, currency)}</span>
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  if (productEntries.length === 0) {
    return (
      <div className="govuk-inset-text govuk-!-margin-top-6">
        <p className="govuk-body">No products found</p>
      </div>
    );
  }


  const filteredProductEntries = productEntries.filter(([, product]) =>
    showNoStock || product.quantity !== 0
  );

  return (
    <div className="govuk-!-margin-top-4">
      <h1 className="govuk-heading-xl">{filteredProductEntries.length} result{filteredProductEntries.length !== 1 ? 's' : ''} found</h1>
      <div className="govuk-checkboxes govuk-checkboxes--small" style={{ marginBottom: '20px' }}>
        <div className="govuk-checkboxes__item">
          <input
            className="govuk-checkboxes__input"
            id="show-updated-time"
            name="show-updated-time"
            type="checkbox"
            checked={showUpdatedTime}
            onChange={(e) => setShowUpdatedTime(e.target.checked)}
          />
          <label className="govuk-label govuk-checkboxes__label" htmlFor="show-updated-time">
            Show updated time
          </label>
        </div>
        <div className="govuk-checkboxes__item">
          <input
            className="govuk-checkboxes__input"
            id="show-no-stock"
            name="show-no-stock"
            type="checkbox"
            checked={showNoStock}
            onChange={(e) => setShowNoStock(e.target.checked)}
          />
          <label className="govuk-label govuk-checkboxes__label" htmlFor="show-no-stock">
            Show out of stock
          </label>
        </div>
        <div className="govuk-checkboxes__item">
          <input
            className="govuk-checkboxes__input"
            id="show-promotions"
            name="show-promotions"
            type="checkbox"
            checked={showPromotions}
            onChange={(e) => setShowPromotions(e.target.checked)}
          />
          <label className="govuk-label govuk-checkboxes__label" htmlFor="show-promotions">
            Show promotions
          </label>
        </div>
      </div>
      {filteredProductEntries.map(([store, product]) => (
        <div key={store} id={(product.store || store).toUpperCase()} className="govuk-!-margin-bottom-4">
          <div className="govuk-panel govuk-panel--confirmation" style={{ backgroundColor: '#1d70b8', padding: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 className="govuk-panel__title" style={{ fontSize: '1.5rem', marginBottom: 0 }}>
                  {formatStoreName(product.store || store)}
                </h3>
                {showUpdatedTime && product.time && product.time > 0 && (
                  <p style={{ fontSize: '0.875rem', fontWeight: 'normal', marginTop: '4px', marginBottom: 0, color: '#ffffff', textAlign: 'left' }}>
                    {formatDate(product.time)}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <p className="govuk-body-s" style={{
                  color: '#ffffff',
                  marginBottom: 0,
                  textAlign: 'right',
                  visibility: shareSuccess === (product.store || store) ? 'visible' : 'hidden'
                }}>
                  Copied
                </p>
                <button
                  onClick={() => handleShare(product.store || store, product.name || 'Product')}
                  className="govuk-button govuk-button--secondary"
                  style={{ marginBottom: 0 }}
                  title="Share link to this product"
                >
                  Share
                </button>
              </div>
            </div>
          </div>

          <div className="govuk-!-margin-top-4">
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-half" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {(() => {
                  const validImages = getValidImages(product.images);
                  if (validImages.length === 0) return null;

                  const imageSrc = validImages[selectedImage[store] || 0];
                  if (!imageSrc) return null;

                  return (
                    <div style={{ position: 'relative', aspectRatio: '1/1', width: '100%', maxWidth: '320px', overflow: 'hidden' }}>
                      <Image
                        src={imageSrc}
                        alt={product.name || 'Product image'}
                        fill
                        style={{ objectFit: 'contain', cursor: 'pointer' }}
                        sizes="(max-width: 480px) 280px, (max-width: 768px) 320px, (max-width: 1200px) 40vw, 33vw"
                        onClick={() => openPrivateLink(imageSrc)}
                        onError={(e) => {
                          console.error('Image failed to load:', imageSrc);
                          e.currentTarget.style.display = 'none';
                        }}
                        priority={false}
                        unoptimized
                      />
                    </div>
                  );
                })()}
                
                {(() => {
                  const validImages = getValidImages(product.images);
                  const scrollState = scrollPositions[store] || { atStart: true, atEnd: false };
                  return validImages.length > 1 && (
                    <div style={{ width: '100%', maxWidth: '320px', marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      {validImages.length > 5 && (
                        <button
                          onClick={() => {
                            const container = scrollContainerRefs.current[store];
                            if (container) {
                              container.scrollBy({ left: -200, behavior: 'smooth' });
                            }
                          }}
                          disabled={scrollState.atStart}
                          style={{
                            width: '28px',
                            height: '56px',
                            flexShrink: 0,
                            backgroundColor: scrollState.atStart ? '#b1b4b6' : '#1d70b8',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: scrollState.atStart ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            padding: 0,
                            lineHeight: 1,
                            opacity: scrollState.atStart ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => !scrollState.atStart && (e.currentTarget.style.backgroundColor = '#003078')}
                          onMouseLeave={(e) => !scrollState.atStart && (e.currentTarget.style.backgroundColor = '#1d70b8')}
                          title="Scroll to see previous images"
                        >
                          ‹
                        </button>
                      )}
                      <div
                        ref={(el) => { scrollContainerRefs.current[store] = el; }}
                        onScroll={(e) => updateScrollPosition(store, e.currentTarget)}
                        style={{
                          display: 'flex',
                          gap: '8px',
                          overflowX: 'auto',
                          paddingBottom: '8px',
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#505a5f #f3f2f1',
                          flex: 1
                        }}>
                        {validImages.map((image, index) => (
                          <div
                            key={index}
                            style={{
                              position: 'relative',
                              width: '56px',
                              height: '56px',
                              flexShrink: 0,
                              cursor: 'pointer',
                              border: (selectedImage[store] || 0) === index ? '3px solid #1d70b8' : '1px solid #b1b4b6',
                              borderRadius: '4px',
                              overflow: 'hidden',
                              transition: 'opacity 0.2s'
                            }}
                            onClick={() => setSelectedImage(prev => ({ ...prev, [store]: index }))}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          >
                            <Image
                              src={image}
                              alt={`${product.name} ${index + 1}`}
                              fill
                              style={{ objectFit: 'cover' }}
                              sizes="56px"
                              onError={(e) => {
                                console.error('Thumbnail failed to load:', image);
                                e.currentTarget.style.display = 'none';
                              }}
                              unoptimized
                            />
                          </div>
                        ))}
                      </div>
                      {validImages.length > 5 && (
                        <button
                          onClick={() => {
                            const container = scrollContainerRefs.current[store];
                            if (container) {
                              container.scrollBy({ left: 200, behavior: 'smooth' });
                            }
                          }}
                          disabled={scrollState.atEnd}
                          style={{
                            width: '28px',
                            height: '56px',
                            flexShrink: 0,
                            backgroundColor: scrollState.atEnd ? '#b1b4b6' : '#1d70b8',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: scrollState.atEnd ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            padding: 0,
                            lineHeight: 1,
                            opacity: scrollState.atEnd ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => !scrollState.atEnd && (e.currentTarget.style.backgroundColor = '#003078')}
                          onMouseLeave={(e) => !scrollState.atEnd && (e.currentTarget.style.backgroundColor = '#1d70b8')}
                          title="Scroll to see more images"
                        >
                          ›
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="govuk-grid-column-one-half">
                <h3 className="govuk-heading-m" style={{ marginBottom: '5px' }}>
                  {product.url ? (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        openPrivateLink(product.url);
                      }}
                      className="govuk-link"
                      style={{ textDecoration: 'underline' }}
                    >
                      {product.name || 'Unknown Product'}
                    </a>
                  ) : (
                    product.name || 'Unknown Product'
                  )}
                </h3>
                {product.brand && (
                  <p className="govuk-body" style={{ color: '#505a5f', marginBottom: '10px' }}>by {product.brand}</p>
                )}

                <p className="govuk-body-s" style={{ color: '#505a5f', marginBottom: '10px' }}>
                  ID: {product.id}
                </p>

                {product.categories && product.categories.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                    {[...new Set(product.categories)].filter(category => category !== 'None').slice(0, 5).map((category, index) => (
                      <strong key={index} className="govuk-tag" style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {category}
                      </strong>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: '15px' }}>
                  {product.price > 0 && (
                    <>
                      <p className="govuk-body" style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>
                        {formatPrice(product.price, product.currency)}
                      </p>
                      {product.discounts && product.discounts.length > 0 && (
                        <div style={{ marginTop: '8px', marginBottom: '10px' }}>
                          {product.discounts.map((discountPrice, index) => {
                            const discount = typeof discountPrice === 'number' ? discountPrice : parseFloat(discountPrice);
                            if (discount === product.price) return null;
                            const percentage = Math.round(((product.price - discount) / product.price) * 100);
                            return (
                              <div key={index} className="govuk-warning-text" style={{ border: '2px solid #d4351c', backgroundColor: '#fff5f5', padding: '12px', marginBottom: '8px' }}>
                                <p className="govuk-body" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d4351c', marginBottom: '3px' }}>
                                  {formatPrice(discount, product.currency)}
                                </p>
                                <p className="govuk-body-s" style={{ fontWeight: 'bold', color: '#d4351c', marginBottom: 0 }}>
                                  {percentage}% OFF
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}

                  {product.unit_price > 0 && product.unit_of_measure && (
                    <p className="govuk-body-s" style={{ color: '#505a5f', marginBottom: '5px' }}>
                      {formatPrice(product.unit_price, product.currency)}/{product.unit_of_measure}
                    </p>
                  )}

                  {product.quantity > 0 && (
                    <p className="govuk-body-s" style={{ color: '#505a5f', marginBottom: '5px' }}>
                      Min. Stock: {product.quantity}
                    </p>
                  )}
                  {product.quantity === 0 && (
                    <div className="govuk-warning-text" style={{ border: '2px solid #d4351c', backgroundColor: '#fff5f5', padding: '10px', marginTop: '8px' }}>
                      <p className="govuk-body-s" style={{ fontWeight: 'bold', color: '#d4351c', marginBottom: 0 }}>
                        NO STOCK AVAILABLE
                      </p>
                    </div>
                  )}
                </div>

                {product.rating > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
                    <span className="govuk-body">
                      Rating: <strong>{(product.rating * 5).toFixed(2)}</strong>/5
                    </span>
                    {product.rating_count > 0 && (
                      <span className="govuk-body-s" style={{ color: '#505a5f' }}>
                        ({product.rating_count} reviews)
                      </span>
                    )}
                  </div>
                )}

                {product.promotions && product.promotions.length > 0 && (
                  <div>
                    <details className="govuk-details" style={{ marginBottom: 0 }} open={showPromotions}>
                      <summary className="govuk-details__summary">
                        <span className="govuk-details__summary-text">
                          Promotions
                        </span>
                      </summary>
                      <div className="govuk-details__text" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {product.promotions.map((promo, index) =>
                          renderPromotion(promo, index, product.currency)
                        )}
                      </div>
                    </details>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}