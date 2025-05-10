import { Capacitor } from '@capacitor/core';
import type { Book } from '../types';

// Mock implementation for web
const WebPurchases = {
  async configure() {
    console.log('Purchases configured for web');
  },
  
  async getProducts() {
    return { products: [] };
  },
  
  async purchaseProduct() {
    throw new Error('Purchases are only available in the mobile app');
  },
  
  async restorePurchases() {
    return { customerInfo: { entitlements: { active: {} } } };
  }
};

// Initialize purchases plugin
let PurchasesPlugin = WebPurchases;

async function initializePlugin() {
  if (Capacitor.isNativePlatform()) {
    const module = await import('@revenuecat/purchases-capacitor');
    PurchasesPlugin = module.Purchases;
  }
}

export async function initializePurchases() {
  await initializePlugin();
  
  if (Capacitor.isNativePlatform()) {
    await PurchasesPlugin.configure({
      apiKey: "YOUR_GOOGLE_PLAY_LICENSE_KEY" // Replace with your actual license key
    });
  }
}

export async function purchaseBook(book: Book) {
  try {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('Purchases are only available in the mobile app');
    }

    // Get product info
    const { products } = await PurchasesPlugin.getProducts({
      productIds: [`book_${book.id}`]
    });

    if (!products.length) {
      throw new Error('Product not found');
    }

    // Purchase the product
    const { customerInfo } = await PurchasesPlugin.purchaseProduct({
      productIdentifier: products[0].identifier
    });

    // Verify the purchase
    const entitlements = customerInfo.entitlements.active;
    const isPurchased = entitlements[`book_${book.id}`]?.isActive;

    return isPurchased;
  } catch (error: any) {
    console.error('Purchase error:', error);
    throw new Error(error.message || 'Failed to purchase book');
  }
}

export async function restorePurchases() {
  try {
    if (!Capacitor.isNativePlatform()) {
      return { entitlements: {} };
    }

    const { customerInfo } = await PurchasesPlugin.restorePurchases();
    return customerInfo.entitlements.active;
  } catch (error) {
    console.error('Restore purchases error:', error);
    throw error;
  }
}
