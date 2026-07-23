export const appConfig = {
  hasFirebase: !!import.meta.env.VITE_FIREBASE_API_KEY,
  hasCloudinary: !!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  hasGroq: !!import.meta.env.VITE_GROQ_API_KEY,
}

export const isDemo = !appConfig.hasFirebase
