import { createVertex } from '@ai-sdk/google-vertex';
import { streamText } from 'ai';

export const maxDuration = 30;

function patchedFetchForFinetune(
  requestInfo: RequestInfo | URL,
  requestInit?: RequestInit
): Promise<Response> {
  function patchString(str: string) {
    return str.replace(`/publishers/google/models`, `/endpoints`)
  }

  if (requestInfo instanceof URL) {
    let patchedUrl = new URL(requestInfo)
    patchedUrl.pathname = patchString(patchedUrl.pathname)
    return fetch(patchedUrl, requestInit)
  }
  if (requestInfo instanceof Request) {
    let patchedUrl = patchString(requestInfo.url)
    let patchedRequest = new Request(patchedUrl, requestInfo)
    return fetch(patchedRequest, requestInit)
  }
  if (typeof requestInfo === 'string') {
    let patchedUrl = patchString(requestInfo)
    return fetch(patchedUrl, requestInit)
  }
  // Should never happen
  throw new Error('Unexpected requestInfo type: ' + typeof requestInfo)
}

const vertex = createVertex({
  project: 'ecosortify-459004',
  location: 'us-central1',
  googleAuthOptions: {
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
  },
  fetch: patchedFetchForFinetune as unknown as typeof globalThis.fetch,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    messages,
    temperature: 1,
    topP: 1,
    maxTokens: 8192,
    model: vertex('1199379169415266304', {
      safetySettings: [
        {category: "HARM_CATEGORY_HATE_SPEECH", threshold: "OFF"},
        {category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "OFF"},
        {category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "OFF"},
        {category: "HARM_CATEGORY_HARASSMENT", threshold: "OFF"}
      ]
    }),
    system: `
      Kamu adalah chatbot aplikasi EcoSortify bernama "SortiBot" yang mengkhususkan diri dalam menjawab pertanyaan seputar edukasi pengetahuan dan pemilahan sampah. Tujuan kamu adalah memberikan jawaban yang edukatif, jelas, dan mudah dipahami oleh pengguna umum dalam bahasa Indonesia. Jawaban kamu harus berbobot dan komprehensif, tetapi tetap ringkas dan tidak terlalu kaku atau terlalu formal. Gunakan gaya bahasa yang ramah, khas seperti chatbot yang siap membantu pengguna. Gunakan konteks dari pertanyaan yang saya berikan untuk memberikan jawaban terbaik. Jawaban tidak perlu terlalu panjang, tapi harus mengandung informasi yang akurat dan bermanfaat. Jika saya memberikan pertanyaan, cukup jawab langsung sesuai instruksi di atas. Tapi jika diperlukan, berikan tambahan penjelasan lebih lengkap lainnya.

      Ketentuan:
      - Jangan pernah mencantumkan cite berupa format seperti ini [cite: number] atau [source: number] di akhir jawaban yang kamu berikan.
      - Jangan menggunakan bahasa "Gue" atau "Lu".
      - Jika ada yang menanyakan kamu itu siapa (memperkenalkan diri), jawab sesuai instruksi yang sudah saya berikan.
    `,
  });

  // Panggil API: Simpah chat ke DB

  return result.toDataStreamResponse();
}