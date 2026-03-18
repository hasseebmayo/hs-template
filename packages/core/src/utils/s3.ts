import {
	DeleteObjectsCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ----------------------
// Types
// ----------------------
export interface S3Config {
	bucketName?: string;
	region?: string;
	accessKeyId?: string;
	secretAccessKey?: string;
	awsBucketUrl?: string;
}

// ----------------------
// Config Helper
// ----------------------
const getS3Config = (config?: S3Config): Required<S3Config> => {
	return {
		bucketName: config?.bucketName ?? process.env.S3_BUCKET_NAME ?? "",
		region: config?.region ?? process.env.S3_BUCKET_REGION ?? "",
		accessKeyId: config?.accessKeyId ?? process.env.S3_ACCESS_KEY ?? "",
		secretAccessKey: config?.secretAccessKey ?? process.env.S3_SECRET_KEY ?? "",
		awsBucketUrl: config?.awsBucketUrl ?? process.env.AWS_BUCKET_URL ?? "",
	};
};

// ----------------------
// Client Factory
// ----------------------
const getS3Client = (config?: S3Config): S3Client => {
	const s3Config = getS3Config(config);

	return new S3Client({
		region: s3Config.region,
		credentials: {
			accessKeyId: s3Config.accessKeyId,
			secretAccessKey: s3Config.secretAccessKey,
		},
	});
};

// ----------------------
// Utils
// ----------------------

/**
 * Uploads a file to S3.
 */
export const uploadFileToS3 = async (
	file: File,
	directory?: string,
	config?: S3Config,
): Promise<string> => {
	const s3Config = getS3Config(config);
	const s3Client = getS3Client(config);

	const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
	const extension = file.type.split("/")[1] || "bin";
	const uniqueKey = `${sanitizedFileName}-${Date.now()}.${extension}`;
	const key = directory ? `${directory}/${uniqueKey}` : uniqueKey;

	const buffer = Buffer.from(await file.arrayBuffer());

	await s3Client.send(
		new PutObjectCommand({
			Bucket: s3Config.bucketName,
			Key: key,
			Body: buffer,
		}),
	);

	return `${s3Config.awsBucketUrl}/${key}`;
};

/**
 * Deletes one or multiple objects from S3.
 */
export const deleteObjectsFromS3 = async (
	keys: string | string[],
	config?: S3Config,
): Promise<void> => {
	const s3Config = getS3Config(config);
	const s3Client = getS3Client(config);
	const keysArray = Array.isArray(keys) ? keys : [keys];

	await s3Client.send(
		new DeleteObjectsCommand({
			Bucket: s3Config.bucketName,
			Delete: {
				Objects: keysArray.map((key) => ({ Key: key })),
				Quiet: false,
			},
		}),
	);
};

/**
 * Generates a signed URL for uploading a file.
 */
export const generateUploadUrl = async (
	key: string,
	expiresIn = 3600,
	config?: S3Config,
): Promise<string> => {
	const s3Config = getS3Config(config);
	const s3Client = getS3Client(config);

	const command = new PutObjectCommand({
		Bucket: s3Config.bucketName,
		Key: key,
	});

	return getSignedUrl(s3Client, command, { expiresIn });
};

/**
 * Generates a signed URL for downloading a file.
 */
export const generateDownloadUrl = async (
	key: string,
	expiresIn = 3600,
	config?: S3Config,
): Promise<string> => {
	const s3Config = getS3Config(config);
	const s3Client = getS3Client(config);

	const command = new GetObjectCommand({
		Bucket: s3Config.bucketName,
		Key: key,
	});

	return getSignedUrl(s3Client, command, { expiresIn });
};

/**
 * Generates a presigned URL for uploading a file.
 * File will be publicly accessible if bucket has public read policy for this path.
 * This allows direct upload from frontend to S3.
 */
export const generatePublicUploadUrl = async (
	key: string,
	expiresIn = 3600,
	config?: S3Config,
): Promise<string> => {
	const s3Config = getS3Config(config);
	const s3Client = getS3Client(config);

	const command = new PutObjectCommand({
		Bucket: s3Config.bucketName,
		Key: key,
		// Don't set ACL - modern S3 buckets have ACLs disabled
		// Make sure your bucket policy allows public read for assets/* path
	});

	return getSignedUrl(s3Client, command, { expiresIn });
};

/**
 * Gets the public URL for an asset (no signed URL needed).
 */
export const getPublicAssetUrl = (key: string, config?: S3Config): string => {
	const s3Config = getS3Config(config);
	return `${s3Config.awsBucketUrl}/${key}`;
};
