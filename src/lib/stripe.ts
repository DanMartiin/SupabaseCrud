import Stripe from 'stripe'

// Check if Stripe secret key exists
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe functionality will be disabled.')
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
}) : null

export { stripe }

export async function createPaymentIntent(amount: number, productId: string, userId: string) {
  if (!stripe) {
    return { paymentIntent: null, error: new Error('Stripe is not configured') }
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to centavos (PHP cents)
      currency: 'php',
      metadata: {
        product_id: productId,
        user_id: userId,
      },
    })

    return { paymentIntent, error: null }
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return { paymentIntent: null, error }
  }
}

export async function createProduct(name: string, description: string, price: number) {
  if (!stripe) {
    return { product: null, price: null, error: new Error('Stripe is not configured') }
  }

  try {
    const product = await stripe.products.create({
      name,
      description,
    })

    const priceObj = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(price * 100),
      currency: 'php',
    })

    return { product, price: priceObj, error: null }
  } catch (error) {
    console.error('Error creating product:', error)
    return { product: null, price: null, error }
  }
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  if (!stripe) {
    return { paymentIntent: null, error: new Error('Stripe is not configured') }
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return { paymentIntent, error: null }
  } catch (error) {
    console.error('Error retrieving payment intent:', error)
    return { paymentIntent: null, error }
  }
}








