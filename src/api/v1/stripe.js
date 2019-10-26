import { Router } from 'express';
import Stripe from 'stripe';

import User from '../../models/user';
import Plan from '../../models/plan';

import { generateToken } from './actions/user/updateUser';

const { STRIPE_SECRET } = process.env;

const router = Router();
const stripe = Stripe(STRIPE_SECRET);

const findUser = userID => new Promise((resolve, reject) => {
  User.findOne({ _id: userID }, (error, user) => {
    if (error) reject(error);
    resolve(user);
  });
});

const updateUserIsPro = async (userId, checkoutData) => {
  const user = await findUser(userId);

  user.isPro = true;
  user.checkoutData = checkoutData;

  const token = generateToken(user);

  return new Promise((resolve, reject) => {
    user.save(error => {
      if (error) reject(error);
      resolve(token);
    })
  });
}


const createSubscriptionOnStripe = (customerId, planId) => {
  try {
    return stripe.subscriptions.create({
      customer: customerId,
      items: [{plan: planId}]
    })
  } catch(exception) {
    throw new Error(`[charge.createSubscriptionOnStripe] ${exception.message}`);
  }
}

const createCustomerOnStripe = (email, tokenId) => {
  try {
    return stripe.customers.create({
      email: email,
      source: tokenId,
    });
  } catch(exception) {
    throw new Error(`[charge.createCustomerOnStripe] ${exception.message}`);
  }
}

const createPlan = (stripeId, amount) => new Promise((resolve, reject) => {
  const plan = new Plan({ stripeId, amount });
  plan.save(error => {
    if (error) reject(error);
    resolve(plan);
  });
})

const createPlanOnStripe = (productId, amount) => {
  try {
    return stripe.plans.create({
      product: productId,
      nickname: `Feather Plus ${amount} MXN`,
      currency: 'mxn',
      interval: 'month',
      amount: amount,
    })
  } catch(exception) {
    throw new Error(`[charge.createPlanOnStripe] ${exception.message}`);
  }
}

const fetchPlan = (amount) => new Promise((resolve, reject) => {
    Plan.findOne({ amount }, (error, plan) => {
      if (error) reject(error);
      resolve({ id: plan ? plan.stripeId : null });
    });
  })

const createProductOnStripe = () => {
  try {
    return stripe.products.create({
      name: 'Feather Plus',
      type: 'service'
    })
  } catch(exception) {
    throw new Error(`[charge.createProductOnStripe] ${exception.message}`);
  }
}

const convertPriceToStripeAmount = (price) => {
  let parts = price.split('.');
  let strPrice = price

  if (parts.length <= 1) strPrice = `${price}00`;
  else if (parts.length > 1 && parts[1].length === 1) strPrice = `${parts[0]}${parts[1]}0`;
  else strPrice = `${parts[0]}${parts[1]}`;

  return parseInt(strPrice);
}

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.body) throw new Error('options.body is required.');
    if (!options.body.user) throw new Error('options.body.user is required.');
    if (!options.body.checkoutData) throw new Error('options.body.checkoutData is required.');
    if (!options.body.checkoutData.donationAmount) throw new Error('options.body.checkoutData.donationAmount is required.');
    if (parseFloat(options.body.checkoutData.donationAmount) < 3) throw new Error('options.body.checkoutData.donationAmount needs to be higher than 3.');
    if (!options.body.tokenId) throw new Error('options.body.tokenId is required.');
  } catch (exception) {
    throw new Error(`[charge.validateOptions] ${exception.message}`);
  }
}

const charge = async ({ body }, res) => {
  try {
    const { user, checkoutData, tokenId } = body;
    const { donationAmount, ...remainingCheckoutData } = checkoutData

    validateOptions({ body });

    const formattedAmount = convertPriceToStripeAmount(donationAmount);
    const product = await createProductOnStripe();
    let plan = await fetchPlan(formattedAmount);

    if (!plan.id) {
      plan = await createPlanOnStripe(product.id, formattedAmount);
      await createPlan(plan.id, formattedAmount);
    }

    const customer = await createCustomerOnStripe(user.email, tokenId);
    await createSubscriptionOnStripe(customer.id, plan.id);
    const token = await updateUserIsPro(user.id, remainingCheckoutData);
    res.status(200).send({ token });
  } catch (exception) {
    res.status(500).end();
    throw new Error(`[charge] ${exception.message}`);
  }
}

router.post('/charge', charge);

export default router;
