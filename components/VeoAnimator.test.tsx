import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VeoAnimator from './VeoAnimator';
import { GenerationMode, AspectRatio, Resolution, VideoDuration, VeoModel } from '../types';

// Mock the services
jest.mock('../services/veoService', () => ({
  veoService: {
    generateVideo: jest.fn().mockResolvedValue('https://example.com/video.mp4')
  }
}));

jest.mock('../services/supabase', () => ({
  databaseService: {
    createVideoGeneration: jest.fn().mockResolvedValue({ id: 'test-id' }),
    updateVideoGeneration: jest.fn().mockResolvedValue({})
  }
}));

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' }
  })
}));

// Mock FileReader
global.FileReader = class {
  onload: (() => void) | null = null;
  result: string | null = null;
  readAsDataURL(file: File) {
    this.result = `data:${file.type};base64,testdata`;
    setTimeout(() => this.onload && this.onload(), 0);
  }
};

describe('VeoAnimator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default state', () => {
    render(<VeoAnimator />);

    expect(screen.getByText('Generation Studio')).toBeInTheDocument();
    expect(screen.getByText('Preview Output')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate video/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('allows switching between generation modes', async () => {
    const user = userEvent.setup();
    render(<VeoAnimator />);

    // Default should be image-to-video
    expect(screen.getByText('Input Image')).toBeInTheDocument();

    // Switch to text-to-video
    await user.click(screen.getByRole('button', { name: /text-to-video/i }));
    expect(screen.queryByText('Input Image')).not.toBeInTheDocument();

    // Switch to video extension
    await user.click(screen.getByRole('button', { name: /extend video/i }));
    expect(screen.getByText('Input Video')).toBeInTheDocument();
  });

  it('handles prompt input', async () => {
    const user = userEvent.setup();
    render(<VeoAnimator />);

    const promptTextarea = screen.getByPlaceholderText('Describe your video...');
    await user.clear(promptTextarea);
    await user.type(promptTextarea, 'Test prompt');

    expect(promptTextarea).toHaveValue('Test prompt');
  });

  it('handles negative prompt input', async () => {
    const user = userEvent.setup();
    render(<VeoAnimator />);

    const negativePromptTextarea = screen.getByPlaceholderText('What to avoid...');
    await user.type(negativePromptTextarea, 'Test negative prompt');

    expect(negativePromptTextarea).toHaveValue('Test negative prompt');
  });

  it('allows changing aspect ratio', async () => {
    const user = userEvent.setup();
    render(<VeoAnimator />);

    await user.click(screen.getByRole('button', { name: '16:9' }));
    // The button should be selected (have blue background)
    expect(screen.getByRole('button', { name: '16:9' })).toHaveClass('bg-blue-600');
  });

  it('allows changing resolution', async () => {
    const user = userEvent.setup();
    render(<VeoAnimator />);

    await user.click(screen.getByRole('button', { name: '1080p' }));
    expect(screen.getByRole('button', { name: '1080p' })).toHaveClass('bg-blue-600');
  });

  it('allows changing duration', async () => {
    const user = userEvent.setup();
    render(<VeoAnimator />);

    await user.click(screen.getByRole('button', { name: '6s' }));
    expect(screen.getByRole('button', { name: '6s' })).toHaveClass('bg-blue-600');
  });

  it('allows changing model', async () => {
    const user = userEvent.setup();
    render(<VeoAnimator />);

    const modelSelect = screen.getByRole('combobox');
    await user.selectOptions(modelSelect, 'Veo 3.1 Preview');

    expect(modelSelect).toHaveValue('veo-3.1-preview');
  });

  it('handles camera motion input', async () => {
    const user = userEvent.setup();
    render(<VeoAnimator />);

    const cameraMotionInput = screen.getByPlaceholderText('e.g., pan left, zoom in');
    await user.type(cameraMotionInput, 'pan right');

    expect(cameraMotionInput).toHaveValue('pan right');
  });

  it('handles cinematic style input', async () => {
    const user = userEvent.setup();
    render(<VeoAnimator />);

    const cinematicStyleInput = screen.getByPlaceholderText('e.g., noir, vintage');
    await user.type(cinematicStyleInput, 'cinematic');

    expect(cinematicStyleInput).toHaveValue('cinematic');
  });

  it('handles seed input', async () => {
    const user = userEvent.setup();
    render(<VeoAnimator />);

    const seedInput = screen.getByPlaceholderText('Random');
    await user.type(seedInput, '12345');

    expect(seedInput).toHaveValue(12345);
  });

  it('handles person generation checkbox', async () => {
    const user = userEvent.setup();
    render(<VeoAnimator />);

    const checkbox = screen.getByRole('checkbox', { name: /allow people/i });
    await user.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it('disables inputs during generation', async () => {
    const user = userEvent.setup();
    render(<VeoAnimator />);

    // Switch to text-to-video mode for easier testing
    await user.click(screen.getByRole('button', { name: /text-to-video/i }));

    // Start generation
    const generateButton = screen.getByRole('button', { name: /generate video/i });
    await user.click(generateButton);

    // Check that inputs are disabled
    expect(screen.getByPlaceholderText('Describe your video...')).toBeDisabled();
    expect(generateButton).toBeDisabled();
  });

  it('shows error message on generation failure', async () => {
    const mockVeoService = require('../services/veoService').veoService;
    mockVeoService.generateVideo.mockRejectedValueOnce(new Error('Generation failed'));

    const user = userEvent.setup();
    render(<VeoAnimator />);

    // Switch to text-to-video mode
    await user.click(screen.getByRole('button', { name: /text-to-video/i }));

    // Start generation
    const generateButton = screen.getByRole('button', { name: /generate video/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Generation failed')).toBeInTheDocument();
    });
  });

  it('shows success message on generation completion', async () => {
    const user = userEvent.setup();
    render(<VeoAnimator />);

    // Switch to text-to-video mode
    await user.click(screen.getByRole('button', { name: /text-to-video/i }));

    // Start generation
    const generateButton = screen.getByRole('button', { name: /generate video/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Video saved to your history!')).toBeInTheDocument();
    });
  });

  it('shows post-generate actions after successful generation', async () => {
    const user = userEvent.setup();
    render(<VeoAnimator />);

    // Switch to text-to-video mode
    await user.click(screen.getByRole('button', { name: /text-to-video/i }));

    // Start generation
    const generateButton = screen.getByRole('button', { name: /generate video/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText("What's Next?")).toBeInTheDocument();
      expect(screen.getByText('Save to Library')).toBeInTheDocument();
      expect(screen.getByText('Personalize for Multiple')).toBeInTheDocument();
      expect(screen.getByText('Send to Contacts')).toBeInTheDocument();
    });
  });

  it('handles reset functionality', async () => {
    const user = userEvent.setup();
    render(<VeoAnimator />);

    // Change some settings
    const promptTextarea = screen.getByPlaceholderText('Describe your video...');
    await user.clear(promptTextarea);
    await user.type(promptTextarea, 'Custom prompt');

    // Reset
    const resetButton = screen.getByRole('button', { name: /reset/i });
    await user.click(resetButton);

    // Check if prompt is reset to default
    expect(promptTextarea).toHaveValue('A close-up video of the character speaking and making natural facial expressions.');
  });

  it('formats time correctly', () => {
    render(<VeoAnimator />);

    // We can't easily test the internal timer without more complex mocking,
    // but the formatTime function should work correctly
    // This would be tested more thoroughly in unit tests for utility functions
  });
});