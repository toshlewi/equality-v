import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

export interface PaymentIntentData {
  amount: number;
  currency: string;
  metadata: Record<string, string>;
  customerEmail?: string;
  customerName?: string;
  description?: string;
}

export interface CheckoutSessionData {
  lineItems: Array<{
    price_data: {
      currency: string;
      product_data: {
        name: string;
        description?: string;
      };
      unit_amount: number;
    };
    quantity: number;
  }>;
  metadata: Record<string, string>;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  mode?: 'payment' | 'subscription';
}

/**
 * Create a payment intent for one-time payments
 */
export async function createPaymentIntent(data: PaymentIntentData): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100), // Convert to cents
      currency: data.currency.toLowerCase(),
      metadata: data.metadata,
      description: data.description,
      receipt_email: data.customerEmail,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error('Failed to create payment intent');
  }
}

/**
 * Create a checkout session for Stripe Checkout
 */
export async function createCheckoutSession(data: CheckoutSessionData): Promise<Stripe.Checkout.Session> {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: data.lineItems,
      mode: data.mode || 'payment',
      metadata: data.metadata,
      customer_email: data.customerEmail,
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'KE', 'UG', 'TZ', 'RW', 'ET', 'GH', 'NG', 'ZA'],
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
}

/**
 * Retrieve a payment intent
 */
export async function retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw new Error('Failed to retrieve payment intent');
  }
}

/**
 * Process a refund
 */
export async function processRefund(
  paymentIntentId: string, 
  amount?: number, 
  reason?: Stripe.RefundCreateParams.Reason
): Promise<Stripe.Refund> {
  try {
    const refundData: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100); // Convert to cents
    }

    if (reason) {
      refundData.reason = reason;
    }

    const refund = await stripe.refunds.create(refundData);
    return refund;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw new Error('Failed to process refund');
  }
}

/**
 * Create a customer
 */
export async function createCustomer(data: {
  email: string;
  name: string;
  phone?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Customer> {
  try {
    const customer = await stripe.customers.create({
      email: data.email,
      name: data.name,
      phone: data.phone,
      metadata: data.metadata || {},
    });

    return customer;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw new Error('Failed to create customer');
  }
}

/**
 * Retrieve a customer
 */
export async function retrieveCustomer(customerId: string): Promise<Stripe.Customer> {
  try {
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    return customer;
  } catch (error) {
    console.error('Error retrieving customer:', error);
    throw new Error('Failed to retrieve customer');
  }
}

/**
 * List customer payment methods
 */
export async function listPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data;
  } catch (error) {
    console.error('Error listing payment methods:', error);
    throw new Error('Failed to list payment methods');
  }
}

/**
 * Create a subscription
 */
export async function createSubscription(data: {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: data.customerId,
      items: [{ price: data.priceId }],
      metadata: data.metadata || {},
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw new Error('Failed to create subscription');
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, secret);
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw new Error('Invalid webhook signature');
  }
}

/**
 * Format amount for display
 */
export function formatAmount(amount: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

/**
 * Convert amount to cents
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert cents to amount
 */
export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Get supported currencies
 */
export function getSupportedCurrencies(): string[] {
  return [
    'usd', 'eur', 'gbp', 'cad', 'aud', 'jpy', 'chf', 'nok', 'sek', 'dkk',
    'pln', 'czk', 'huf', 'bgn', 'ron', 'hrk', 'try', 'rub', 'inr', 'cny',
    'hkd', 'sgd', 'nzd', 'mxn', 'brl', 'ars', 'clp', 'cop', 'pen', 'uyu',
    'kes', 'ugx', 'tzs', 'rwf', 'etb', 'ghs', 'ngn', 'zar', 'bwp', 'szl',
    'lsl', 'nad', 'mwk', 'zmw', 'aoa', 'mzn', 'mad', 'tnd', 'dzd', 'egp',
    'lyd', 'sdg', 'ssp', 'sos', 'djf', 'ern', 'etb', 'kmf', 'mga', 'mur',
    'scr', 'sll', 'sos', 'tnd', 'ugx', 'tzs', 'zmw'
  ];
}

// Create payment intent (alias for createPaymentIntent)
export const createPaymentIntentAlias = async (data: PaymentIntentData): Promise<Stripe.PaymentIntent> => {
  return createPaymentIntent(data);
};

// Create checkout session (alias for createCheckoutSession)
export const createCheckoutSessionAlias = async (data: CheckoutSessionData): Promise<Stripe.Checkout.Session> => {
  return createCheckoutSession(data);
};

export default stripe;
