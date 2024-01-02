import OpenAI from 'openai'

const OPEN_AI_KEY = (process.env.OPENAI_KEY) ? process.env.OPENAI_KEY : ""

export const openai = new OpenAI({
  apiKey: OPEN_AI_KEY
})