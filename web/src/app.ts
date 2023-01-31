import { join } from 'path';
import { readFileSync } from 'fs';
import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { WebhookHandlersParam } from '@shopify/shopify-app-express';
dotenv.config();
import express from 'express';
import serveStatic from 'serve-static';
import bodyParser from 'body-parser';
// console.log(process.env)

import shopify from './shopify';
import productCreator from './product-creator';
import GDPRWebhookHandlers from './gdpr';
import ReturnRouter from './returns';
import FrontendRouter from './returns/frontend';
import GorgiasRouter from './gorgias';

const PORT = parseInt(
    (process.env.BACKEND_PORT || process.env.PORT) ?? '3000',
    10
);

const STATIC_PATH =
    process.env.NODE_ENV === 'production'
        ? `${process.cwd()}/frontend/dist`
        : `${process.cwd()}/frontend/`;

const app = express();
// app.use('/*', (req, res, next) => {
//     console.log(req.url, req.baseUrl);
//     console.log(req.query);
//     next();
// });

app.use('/api/gorgias', GorgiasRouter);

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
    shopify.config.auth.callbackPath,
    shopify.auth.callback(),
    shopify.redirectToShopifyOrAppRoot()
);
app.post(
    shopify.config.webhooks.path,
    shopify.processWebhooks({
        webhookHandlers: GDPRWebhookHandlers as WebhookHandlersParam
    })
);

app.use('/api/frontend', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Website you wish to allow to connect
    //res.setHeader("Access-Control-Allow-Origin", "http://localhost:3030");

    // Request methods you wish to allow
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    );

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', '*');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Pass to next layer of middleware
    next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.get('', (req, res) => {
//     console.log(req.url, req.baseUrl);
//     res.status(200).json({ msg: 'ok' });
// });

app.use('/api/frontend/', (req, res, next) => {
    console.log(req.body);
    if (!req.body.shop) {
        return res.status(500).send('No shop id');
    }
    next();
});
app.use('/api/frontend/', FrontendRouter);

// All endpoints after this point will require an active session
app.use('/api/*', shopify.validateAuthenticatedSession());

app.use('/api/session', (req, res) => {
    const { shop } = res.locals.shopify.session;
    res.status(200).json({ shop });
});

app.use('/api/returns', ReturnRouter);

app.get('/api/products/count', async (_req, res) => {
    const countData = await shopify.api.rest.Product.count({
        session: res.locals.shopify.session
    });
    res.status(200).send(countData);
});

app.get('/api/products/create', async (_req, res) => {
    let status = 200;
    let error = null;

    try {
        await productCreator(res.locals.shopify.session);
    } catch (e: any) {
        console.log(`Failed to process products/create: ${e.message}`);
        status = 500;
        error = e.message;
    }
    res.status(status).send({ success: status === 200, error });
});

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use('/*', shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
    return res
        .status(200)
        .set('Content-Type', 'text/html')
        .send(readFileSync(join(STATIC_PATH, 'index.html')));
});

app.listen(PORT, () => {
    console.log(`Backend is running in ${PORT}`);
});
