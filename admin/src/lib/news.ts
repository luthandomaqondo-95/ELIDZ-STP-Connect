export const NEWS_IMAGE_BUCKET = "news-images"
export const NEWS_IMAGE_MAX_BYTES = 5 * 1024 * 1024
export const NEWS_IMAGE_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const
export const NEWS_IMAGE_ACCEPT = NEWS_IMAGE_ALLOWED_TYPES.join(",")

export function isAllowedNewsImageType(type: string) {
  return NEWS_IMAGE_ALLOWED_TYPES.includes(
    type as (typeof NEWS_IMAGE_ALLOWED_TYPES)[number]
  )
}

function getNewsImageExtension(fileName: string, mimeType: string) {
  const fileNameExtension = fileName.split(".").pop()?.toLowerCase()

  if (fileNameExtension) {
    return fileNameExtension
  }

  switch (mimeType) {
    case "image/jpeg":
      return "jpg"
    case "image/png":
      return "png"
    case "image/webp":
      return "webp"
    case "image/gif":
      return "gif"
    default:
      return "jpg"
  }
}

export function buildNewsImagePath(userId: string, fileName: string, mimeType: string) {
  const extension = getNewsImageExtension(fileName, mimeType)
  const baseName = fileName.replace(/\.[^.]+$/, "")
  const sanitizedBaseName =
    baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "cover-image"

  return `${userId}/${Date.now()}-${sanitizedBaseName}.${extension}`
}

export function getLocalDateTimeValue() {
  const now = new Date()
  const timezoneOffset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 16)
}

export function createNewsPublisherInitialForm() {
  return {
    title: "",
    imageUrl: "",
    publishedAt: getLocalDateTimeValue(),
    content: "",
  }
}
