# Veo Animator

Transform static images into dynamic videos using Google's cutting-edge Veo 3.1 AI model. Simply upload an image, describe the animation you want, and watch as AI brings it to life.

## Features

- **Image to Video Generation**: Upload any portrait or landscape image and animate it
- **Natural Language Prompts**: Describe the animation in plain English
- **Flexible Aspect Ratios**: Support for both 9:16 (Portrait) and 16:9 (Landscape) formats
- **Real-time Progress**: Track generation time with a built-in timer
- **Instant Preview & Download**: View and download your generated videos as MP4 files
- **Modern UI**: Clean, professional interface with smooth animations

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A Google Gemini API key with access to Veo 3.1

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

### Getting Your API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key (it starts with "AIza...")

When you first open the app, you'll be prompted to enter your API key. The key is stored securely in your browser's local storage.

## How to Use

1. **Enter Your API Key**: On first launch, paste your Gemini API key
2. **Upload an Image**: Click or drag an image (JPG or PNG) into the upload area
3. **Write Your Prompt**: Describe how you want the image to animate
   - Example: "A close-up video of the character speaking and making natural facial expressions"
   - Example: "The person smiling and looking around with natural head movements"
4. **Choose Aspect Ratio**: Select 9:16 for vertical/portrait or 16:9 for horizontal/landscape
5. **Generate**: Click "Generate Video" and wait (typically takes 30-90 seconds)
6. **Download**: Once complete, preview your video and download it

## Technical Details

### Built With

- **React 19** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Google Generative AI SDK** - Veo 3.1 integration

### Project Structure

```
project/
├── components/
│   ├── VeoAnimator.tsx    # Main animation interface
│   ├── ApiKeyModal.tsx    # API key input modal
│   ├── Button.tsx         # Reusable button component
│   └── Icons.tsx          # SVG icon components
├── services/
│   └── veoService.ts      # Veo API integration
├── types.ts               # TypeScript type definitions
└── App.tsx                # Main application component
```

### API Integration

The app uses the Google Generative AI SDK to:
1. Submit image and prompt to Veo 3.1
2. Poll for generation completion
3. Download the authenticated video
4. Create a local blob URL for preview

## Pricing

Google Gemini API offers free tier usage with generous limits. For production use, check the [official pricing](https://ai.google.dev/gemini-api/docs/billing).

## Troubleshooting

**"API Key not found"**
- Make sure you've entered your API key
- Verify the key starts with "AIza"
- Try refreshing the page

**"Generation failed"**
- Check your internet connection
- Verify your API key is valid
- Ensure you haven't exceeded rate limits

**Video won't play**
- Try a different browser
- Check if the video downloaded successfully
- Verify your image format (JPG/PNG only)

## License

MIT
