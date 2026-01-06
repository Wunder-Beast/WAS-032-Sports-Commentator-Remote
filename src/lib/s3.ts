import {
	GetObjectCommand,
	HeadObjectCommand,
	S3Client,
	type S3ClientConfig,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/env";

const config: S3ClientConfig = {
	region: env.AWS_REGION,
	credentials: {
		accessKeyId: env.AWS_ACCESS_KEY_ID,
		secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
	},
};

if (env.S3_ENDPOINT) {
	config.endpoint = env.S3_ENDPOINT;
	config.forcePathStyle = env.S3_FORCE_PATH_STYLE ?? false;
}

const s3Client = new S3Client(config);

export class S3FileNotFoundError extends Error {
	constructor(key: string) {
		super(`File not found in S3: ${key}`);
		this.name = "S3FileNotFoundError";
	}
}

export async function checkS3ObjectExists(key: string): Promise<boolean> {
	try {
		const command = new HeadObjectCommand({
			Bucket: env.S3_BUCKET_NAME,
			Key: key,
		});

		await s3Client.send(command);
		return true;
	} catch (error) {
		if (
			(error as unknown as { name?: string })?.name === "NotFound" ||
			(error as unknown as { $metadata?: { httpStatusCode?: number } })
				?.$metadata?.httpStatusCode === 404
		) {
			return false;
		}
		throw error;
	}
}

export async function generateVideoSignedUrl(
	key: string,
	expiresIn = 3600,
	forDownload = false,
): Promise<string> {
	const exists = await checkS3ObjectExists(key);

	if (!exists) {
		throw new S3FileNotFoundError(key);
	}

	const command = new GetObjectCommand({
		Bucket: env.S3_BUCKET_NAME,
		Key: key,
		...(forDownload && {
			ResponseContentDisposition: 'attachment; filename="video.mp4"',
		}),
	});

	return await getSignedUrl(s3Client, command, { expiresIn });
}
