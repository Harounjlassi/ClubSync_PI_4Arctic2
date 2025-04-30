from diffusers import StableDiffusionPipeline
import torch

def generate_image(prompt: str, output_path: str = "generated_image.png"):
    try:
        # Check CUDA
        if not torch.cuda.is_available():
            raise RuntimeError("CUDA not available!")

        # Load model (fallback to FP32 if needed)
        pipe = StableDiffusionPipeline.from_pretrained(
            "stabilityai/stable-diffusion-2-1-base",
            torch_dtype=torch.float16,
        ).to("cuda")

        pipe.enable_attention_slicing()

        # Generate and verify
        print("Generating image...")
        result = pipe(prompt, num_inference_steps=30)
        image = result.images[0]

        if image.getextrema() == (0, 0):  # Check if image is all black
            raise ValueError("Generated image is black!")

        image.save(output_path)
        print(f"Image saved to {output_path}")

    except Exception as e:
        print(f"Error: {e}")

# Test with a simple prompt first
generate_image("a photorealistic cat")