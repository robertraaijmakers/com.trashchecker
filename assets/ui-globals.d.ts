import HomeySettings from 'homey/lib/HomeySettings';
import HomeyWidget from 'homey/lib/HomeyWidget';

declare global {
  interface Window {
    onHomeyReady: (homey: HomeySettings | HomeyWidget) => Promise<void>;
  }
}
