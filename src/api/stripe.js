import { Router } from 'express';
import Stripe from 'stripe';

import User from '../models/user';

const router = Router();
const stripe = Stripe('sk_test_b3ryWQAanOC9xV2rowYwmWVr');

let planId = '';

stripe.products.create({
  name: 'Feather Plus',
  type: 'service',
}).then(product => stripe.plans.create({
  product: product.id,
  nickname: 'Feather Plus USD',
  currency: 'usd',
  interval: 'month',
  amount: 599,
}).then(plan => { planId = plan.id; }));

router.post('/charge', ({ body: { user, checkoutData, tokenId } }, res) => {
  stripe.customers.create({
    email: user.email,
    source: tokenId,
  }).then(customer => stripe.subscriptions.create({
    customer: customer.id,
    items: [{plan: planId}]
  })).then(() => {
    User.findOneAndUpdate({ _id: user.id }, { $set: { 'isPro': true, checkoutData } })
      .exec((err) => {
        if (err) return res.status(500).end();
        return res.json({ status: 200 });
      });
  })
  .catch((err) => { console.error(err); res.status(500).end(); });
});

export default router;
