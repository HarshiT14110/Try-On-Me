import { generateText } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { personImage, outfitImage } = await req.json();

    if (!personImage || !outfitImage) {
      return Response.json(
        { error: "Both person image and outfit image are required" },
        { status: 400 }
      );
    }

    const result = await generateText({
      model: "google/gemini-2.5-flash-preview-05-20",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a professional fashion image editor. I'm providing two images:

IMAGE 1 (Person): This is a photo of a person. Keep EVERYTHING about this person exactly the same - their face, facial features, skin tone, hair, body type, body proportions, pose, stance, background, lighting, and overall composition.

IMAGE 2 (Outfit): This contains the outfit/clothing I want to apply.

YOUR TASK: Generate a NEW image that shows the EXACT same person from Image 1 (same face, same body type, same pose, same background, same lighting) but wearing the outfit from Image 2. The result must look like a real, natural photograph - not a collage or obvious edit. The clothing should fit naturally on the person's body and match the lighting and perspective of the original photo. Do NOT change anything about the person's face, hair, skin, body shape, pose or the background. Only change what they are wearing.`,
            },
            {
              type: "image",
              image: personImage,
            },
            {
              type: "image",
              image: outfitImage,
            },
          ],
        },
      ],
    });

    const images = [];
    if (result.files) {
      for (const file of result.files) {
        if (file.mediaType?.startsWith("image/")) {
          images.push({
            base64: file.base64,
            mediaType: file.mediaType,
          });
        }
      }
    }

    if (images.length === 0) {
      return Response.json(
        { error: "No image was generated. Please try again." },
        { status: 500 }
      );
    }

    return Response.json({
      image: images[0],
      text: result.text,
    });
  } catch (error) {
    console.error("Generation error:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate image",
      },
      { status: 500 }
    );
  }
}
