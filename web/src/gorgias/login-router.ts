import { Request, Response } from 'express';

export default async function (req: Request, res: Response) {
    const { account } = req.query;
    if (!account)
        res.status(400).send(
            "missing 'account' query parameter (where the installation was triggered)"
        );
    const host = 'https://' + req.get('host');
    // return res.json({ msg: 'ok' });
    res.redirect(
        `https://${account}.gorgias.com/oauth/authorize?response_type=code&client_id=63d7a46adda5a25e37be7d7a&scope=openid+email+profile+offline+write:all&redirect_uri=${host}/api/gorgias/callback?account=${account}&state=${makeid(
            20
        )}&nonce=${makeid(15)}
        `
    );
}

function makeid(length: number): string {
    let result = '';
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
        counter += 1;
    }
    return result;
}
