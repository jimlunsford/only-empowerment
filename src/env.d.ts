declare const __STAGING__: boolean;
declare const __BUILD__: {
  version: string;
  presentation: 'staging' | 'production';
  commit: string;
  dirty: boolean;
  tag: string | null;
  source: string;
};
