'use client';

import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function VideoPlayerDemo() {
  const handleVideoEnded = () => {
    console.log('Video playback ended');
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-[var(--foreground)] mb-2">
            VideoPlayer Component Demo
          </h1>
          <p className="text-[var(--color-gray-500)]">
            HTML5 Video API with custom controls, keyboard shortcuts, and Framer Motion animations
          </p>
        </div>

        {/* Main Video Player */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Full-Featured Video Player</CardTitle>
          </CardHeader>
          <CardContent>
            <VideoPlayer
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
              onEnded={handleVideoEnded}
              className="w-full aspect-video"
            />
          </CardContent>
        </Card>

        {/* Features List */}
        <Card variant="outlined" padding="lg">
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-3">
                  Playback Controls
                </h3>
                <ul className="space-y-2 text-sm text-[var(--color-gray-500)]">
                  <li>• Play/Pause toggle</li>
                  <li>• Seekable progress bar with drag support</li>
                  <li>• Time display (current/total)</li>
                  <li>• Video ended callback</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-3">
                  Audio Controls
                </h3>
                <ul className="space-y-2 text-sm text-[var(--color-gray-500)]">
                  <li>• Volume slider</li>
                  <li>• Mute/Unmute toggle</li>
                  <li>• Volume icon changes based on level</li>
                  <li>• Hover to reveal volume slider</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-3">
                  Display Features
                </h3>
                <ul className="space-y-2 text-sm text-[var(--color-gray-500)]">
                  <li>• Fullscreen mode</li>
                  <li>• Auto-hide controls on inactivity</li>
                  <li>• Loading spinner</li>
                  <li>• Error state handling</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-3">
                  Keyboard Shortcuts
                </h3>
                <ul className="space-y-2 text-sm text-[var(--color-gray-500)]">
                  <li>• Space/K - Play/Pause</li>
                  <li>• Left/Right Arrow - Seek ±5s</li>
                  <li>• Up/Down Arrow - Volume ±10%</li>
                  <li>• M - Toggle mute</li>
                  <li>• F - Toggle fullscreen</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Example */}
        <Card variant="outlined" padding="lg">
          <CardHeader>
            <CardTitle>Usage Example</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-[var(--color-gray-100)] dark:bg-[var(--color-gray-900)] p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`import { VideoPlayer } from '@/components/ui/VideoPlayer';

export default function MyComponent() {
  const handleVideoEnded = () => {
    console.log('Video finished!');
    // Navigate to next lesson, show completion modal, etc.
  };

  return (
    <VideoPlayer
      src="path/to/video.mp4"
      poster="path/to/poster.jpg"
      onEnded={handleVideoEnded}
      className="w-full aspect-video"
    />
  );
}`}</code>
            </pre>
          </CardContent>
        </Card>

        {/* Props Documentation */}
        <Card variant="outlined" padding="lg">
          <CardHeader>
            <CardTitle>Props</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-3 px-4 font-semibold text-[var(--foreground)]">
                      Prop
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-[var(--foreground)]">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-[var(--foreground)]">
                      Required
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-[var(--foreground)]">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[var(--color-gray-500)]">
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-3 px-4 font-mono text-xs">src</td>
                    <td className="py-3 px-4 font-mono text-xs">string</td>
                    <td className="py-3 px-4">Yes</td>
                    <td className="py-3 px-4">Video source URL</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-3 px-4 font-mono text-xs">poster</td>
                    <td className="py-3 px-4 font-mono text-xs">string</td>
                    <td className="py-3 px-4">No</td>
                    <td className="py-3 px-4">Poster image URL (shown before playback)</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-3 px-4 font-mono text-xs">onEnded</td>
                    <td className="py-3 px-4 font-mono text-xs">() =&gt; void</td>
                    <td className="py-3 px-4">No</td>
                    <td className="py-3 px-4">Callback when video playback ends</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-3 px-4 font-mono text-xs">className</td>
                    <td className="py-3 px-4 font-mono text-xs">string</td>
                    <td className="py-3 px-4">No</td>
                    <td className="py-3 px-4">Additional CSS classes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
