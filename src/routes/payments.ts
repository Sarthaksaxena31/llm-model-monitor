import express, { type Request, type Response } from 'express';

const router = express.Router();

const mockPlans = [
    { id: 'plan_starter', name: 'Starter', price: 9, currency: 'usd', interval: 'month', features: ['10 users', '100k tokens/mo', 'Basic support'], popular: false },
    { id: 'plan_pro', name: 'Pro', price: 29, currency: 'usd', interval: 'month', features: ['50 users', '1M tokens/mo', 'Priority support', 'Analytics'], popular: true },
    { id: 'plan_enterprise', name: 'Enterprise', price: 99, currency: 'usd', interval: 'month', features: ['Unlimited users', '10M tokens/mo', '24/7 support', 'Custom models'], popular: false },
];

const mockInvoices = [
    { id: 'inv_001', amount: 29, currency: 'usd', status: 'paid', date: '2025-03-01', description: 'Pro Plan - March 2025' },
    { id: 'inv_002', amount: 29, currency: 'usd', status: 'paid', date: '2025-02-01', description: 'Pro Plan - February 2025' },
    { id: 'inv_003', amount: 29, currency: 'usd', status: 'paid', date: '2025-01-01', description: 'Pro Plan - January 2025' },
];

const mockProducts = [
    { id: 'prod_001', name: 'Token Pack 1M', price: 15, currency: 'usd', type: 'one_time' },
    { id: 'prod_002', name: 'Token Pack 5M', price: 60, currency: 'usd', type: 'one_time' },
];

// POST /api/v1/payments/stripe/renew
router.post('/renew', (req: Request, res: Response) => {
    const { planName, quantity, organizationName } = req.body;
    return res.json({ success: true, data: { message: `Renewed ${planName} for ${organizationName} (${quantity} seats)` } });
});

// POST /api/v1/payments/stripe/createPortalSession
router.post('/createPortalSession', (req: Request, res: Response) => {
    return res.json({ success: true, data: { url: 'https://billing.stripe.com/mock-portal-session' } });
});

// POST /api/v1/payments/stripe/create-checkout-session
router.post('/create-checkout-session', (req: Request, res: Response) => {
    const { product } = req.body;
    return res.json({
        status: 'success',
        data: { url: `https://checkout.stripe.com/mock-session?product=${product?.id || 'default'}` }
    });
});

// GET /api/v1/payments/stripe/get-all-active-plan
router.get('/get-all-active-plan', (req: Request, res: Response) => {
    return res.json({ success: true, data: mockPlans });
});

// GET /api/v1/payments/stripe/get-customer-invoices
router.get('/get-customer-invoices', (req: Request, res: Response) => {
    return res.json({ success: true, data: mockInvoices });
});

// GET /api/v1/payments/stripe/all-product
router.get('/all-product', (req: Request, res: Response) => {
    return res.json({ success: true, data: mockProducts });
});

// POST /api/v1/payments/stripe/cancel-subscription
router.post('/cancel-subscription', (req: Request, res: Response) => {
    const { subscriptionId } = req.body;
    return res.json({ success: true, message: `Subscription ${subscriptionId} cancelled` });
});

export default router;
