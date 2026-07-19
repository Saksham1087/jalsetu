export const appConfig = {
  hasFirebase: !!import.meta.env.VITE_FIREBASE_API_KEY,
  hasCloudinary: !!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  hasGemini: !!import.meta.env.VITE_GEMINI_API_KEY,
}

export const isDemo = !appConfig.hasFirebase
