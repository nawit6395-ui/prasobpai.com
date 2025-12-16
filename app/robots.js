export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/verify-db'],
        },
        sitemap: 'https://prasobpai.com/sitemap.xml',
    };
}
