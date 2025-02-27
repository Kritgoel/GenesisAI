export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await req.formData();
    const mode = formData.get('mode');
    const prompt = formData.get('prompt');
    const image = formData.get('image');
    
    const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
    
    if (!HUGGINGFACE_API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    switch (mode) {
      case 'text': {
        const enhancedPrompt = `You are a doctor help diagnose patient based on symptom: ${prompt}. Advice what speciality of doctor to visit. Don't show the underlying thought process. Tell possible underlying problems.`;
        const textResponse = await fetch('https://api-inference.huggingface.co/models/google/gemma-7b', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: enhancedPrompt,
            parameters: {
              max_new_tokens: 500,
              temperature: 0.7,
              top_p: 0.95,
              do_sample: true,
              return_full_text: false
            }
          }),
        });

        if (!textResponse.ok) {
          throw new Error(`Text analysis failed: ${textResponse.status}`);
        }

        const textData = await textResponse.json();
        return new Response(JSON.stringify(textData), {
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
        });
      }

      case 'image': {
        const imageResponse = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            inputs: prompt,
            parameters: {
              guidance_scale: 7.5,
              num_inference_steps: 50
            }
          }),
        });

        if (!imageResponse.ok) {
          throw new Error(`Image generation failed: ${imageResponse.status}`);
        }

        const imageData = await imageResponse.arrayBuffer();
        return new Response(imageData, {
          headers: { 
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000'
          },
        });
      }

      case 'multimodal': {
        if (!image) {
          throw new Error('Image is required for multimodal analysis');
        }

        const imageBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(image);
        });

        const multimodalResponse = await fetch('https://api-inference.huggingface.co/models/llava-hf/llava-1.5-13b-hf', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: {
              image: imageBase64,
              prompt: prompt || "Analyze this medical image and describe what you see. Identify any potential abnormalities or areas of concern."
            },
            parameters: {
              max_new_tokens: 500,
              temperature: 0.7,
              top_p: 0.95,
            }
          }),
        });

        if (!multimodalResponse.ok) {
          throw new Error(`Multimodal analysis failed: ${multimodalResponse.status}`);
        }

        const multimodalData = await multimodalResponse.json();
        return new Response(JSON.stringify(multimodalData), {
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
        });
      }

      default:
        throw new Error('Invalid mode specified');
    }
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ 
      error: `Generation failed: ${error.message}` 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
  }
}
