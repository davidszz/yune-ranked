import { ImgurClient } from 'imgur';

const client = new ImgurClient({
	clientId: process.env.IMGUR_CLIENT_ID,
	clientSecret: process.env.IMGUR_CLIENT_SECRET,
	refreshToken: process.env.IMGUR_REFRESH_TOKEN,
});

export async function uploadImage(options: { image: string | Buffer; title?: string; description?: string }) {
	return client.upload(options);
}

export async function deleteImageByHash(hash: string) {
	return client.deleteImage(hash);
}
