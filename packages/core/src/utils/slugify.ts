/**
 * Converts a string to a URL-friendly slug.
 *
 * @param str - The string to convert to a slug
 * @param addRandomString - Whether to add a random suffix for uniqueness
 * @returns A slugified string
 *
 * @example
 * ```ts
 * import { slugify } from "@repo/backend-core/utils"
 *
 * slugify("Hello World")        // "hello-world"
 * slugify("Hello World", true)  // "hello-world-a3f9k2"
 * ```
 */
export function slugify(str: string, addRandomString = false): string {
	// Convert to lowercase and replace spaces with "-"
	let slug = str.toLowerCase().replace(/\s+/g, "-");

	if (addRandomString) {
		// Generate a random string (6 characters from base36)
		const randomStr = Math.random().toString(36).substring(2, 8);
		slug += `-${randomStr}`;
	}

	return slug;
}
