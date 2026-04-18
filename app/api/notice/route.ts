import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { step, imageBase64, question, answer } = body;

    // Step 1: Vision (Claude 3.5 Sonnet)
    if (step === 1) {
      if (!imageBase64) {
        return NextResponse.json({ error: 'Image is required for step 1' }, { status: 400 });
      }

      let mediaType = "image/jpeg";
      let data = imageBase64;
      
      // Parse data URL prefix if present
      if (imageBase64.startsWith("data:")) {
        const match = imageBase64.match(/^data:(image\/[a-zA-Z+]*);base64,(.*)$/);
        if (match) {
          mediaType = match[1];
          data = match[2];
        }
      }

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        system: "You are a brilliant, empathetic creative coach. Look at this mundane object. Ask exactly ONE highly specific, thought-provoking question about a tiny, easily overlooked detail to force the user into 'vuja de' (seeing the familiar in a new way). Keep it under 2 sentences.",
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType as any,
                  data: data,
                },
              },
              {
                type: 'text',
                text: "What tiny, easily overlooked detail in this photo can you ask me about?",
              }
            ],
          },
        ],
      });

      const messageContent = response.content[0];
      const questionText = messageContent.type === 'text' ? messageContent.text : '';

      return NextResponse.json({ question: questionText });
    }

    // Step 2: Grading (Claude 3 Haiku)
    if (step === 2) {
      if (!question || !answer) {
         return NextResponse.json({ error: 'Question and answer required for step 2' }, { status: 400 });
      }

      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: "Evaluate the user's creative noticing skills. Grade them on this rubric: [1x] The Glancer (Literal, basic), [3x] The Observer (Good sensory detail), [5x] The Flourisher (Profound, uses metaphor, deep thinking). Output format: First line MUST BE exactly [1x], [3x], or [5x]. The rest should be a 2-sentence encouraging explanation.",
        messages: [
          {
            role: 'user',
            content: `The original question about the object was: "${question}"\n\nThe user's observation is: "${answer}"\n\nGrade the observation.`,
          },
        ],
      });

      const messageContent = response.content[0];
      const resultText = messageContent.type === 'text' ? messageContent.text : '';

      return NextResponse.json({ result: resultText });
    }

    return NextResponse.json({ error: 'Invalid step' }, { status: 400 });

  } catch (error: any) {
    console.error("Error in Anthropic API:", error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
