import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { topic } = req.body;

  const response = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer YOUR_OPENAI_API_KEY`
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: `Explain the topic "${topic}" in simple terms.`,
      max_tokens: 150
    })
  });

  const data = await response.json();
  res.status(200).json({ result: data.choices[0].text });
}
