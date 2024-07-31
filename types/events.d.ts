export interface DownloaderEvents {
  progress: [{ total: { amount: number; size: number }; downloaded: { amount: number; size: number }; speed: number; eta: number; type: string }]
  error: [{ file: string; error: Error }]
  finish: [{ downloaded: { amount: number; size: number }; errors: number }]
  clean: [{ file: string }]
  cleaned: [{ amount: number }]
}
