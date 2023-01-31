import { Request, Response } from 'express';

export default async function (req: Request, res: Response) {
    const { account, code } = req.query;

    if(code) {
        
    }
    const host = 'https://' + req.get('host');
    return res.json({ msg: 'ok' });
    res.redirect(
        `https://${account}.gorgias.com/oauth/authorize?response_type=code&client_id=63d7a46adda5a25e37be7d7a&scope=openid+email+profile+offline+write:all&redirect_uri=${host}/api/gorgias/callback?account=${account}&state=XZXZV2dXvFudpo8HTaL7cPwGJxr4XS&nonce=0327tRehleepX9gcgA7O
        `
    );
}
