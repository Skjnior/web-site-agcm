/**
 * Service de synchronisation avec Facebook
 * Gère la récupération des posts depuis une page Facebook et la publication
 */

interface FacebookPost {
    id: string;
    message?: string;
    full_picture?: string;
    created_time: string;
    permalink_url: string;
}

export class FacebookService {
    private static PAGE_ID = process.env.FACEBOOK_PAGE_ID;
    private static ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

    /**
     * Récupère les derniers posts d'une page Facebook
     */
    static async getLatestPosts(limit = 5): Promise<FacebookPost[]> {
        if (!this.PAGE_ID || !this.ACCESS_TOKEN) {
            console.warn('Facebook Page ID ou Access Token manquant. Mode simulation activé.');
            return this.simulateFetch(limit);
        }

        try {
            const url = `https://graph.facebook.com/v18.0/${this.PAGE_ID}/posts?fields=id,message,full_picture,created_time,permalink_url&limit=${limit}&access_token=${this.ACCESS_TOKEN}`;
            const response = await fetch(url);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Facebook API Error: ${error.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Erreur lors de la récupération des posts Facebook:', error);
            return [];
        }
    }

    /**
     * Publie un message sur la page Facebook
     */
    static async publishPost(message: string, link?: string): Promise<{ id: string } | null> {
        if (!this.PAGE_ID || !this.ACCESS_TOKEN) {
            console.warn('Facebook Page ID ou Access Token manquant. Publication simulée.');
            return { id: `simulated_post_${Date.now()}` };
        }

        try {
            const url = `https://graph.facebook.com/v18.0/${this.PAGE_ID}/feed`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    link,
                    access_token: this.ACCESS_TOKEN,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Facebook API Error: ${error.error?.message || response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la publication sur Facebook:', error);
            return null;
        }
    }

    /**
     * Simulation pour le développement
     */
    private static simulateFetch(limit: number): FacebookPost[] {
        return Array.from({ length: limit }).map((_, i) => ({
            id: `fb_sim_${i}`,
            message: `Ceci est un post Facebook simulé #${i + 1} de l'AGCM. Accompagné d'un message inspirant sur la solidarité guinéenne.`,
            full_picture: `https://images.unsplash.com/photo-${1500000000000 + i}?w=800&q=80`,
            created_time: new Date(Date.now() - i * 86400000).toISOString(),
            permalink_url: 'https://facebook.com/agcm',
        }));
    }
}
