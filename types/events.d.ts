export interface LauncherEvents {
  launch_compute_download: []
  launch_download: [
    {
      /**
       * The total size/amount of files to download.
       *
       * `total` parameter of `download_progress` event will be specific for each "type" of files:
       * Java, modpack, libraries and natives, and finally assets.
       */
      total: { amount: number; size: number }
    }
  ]
  launch_install_loader: [
    {
      loader: 'vanilla' | 'forge'
      minecraft_version: string
      loader_version: string | null
      loader_type?: 'installer' | 'universal' | 'client'
    }
  ]
  launch_extract_natives: []
  launch_check_java: []
  launch_debug: [string]
}

export interface FilesManagerEvents {
  extract_progress: [{ filename: string }]
  extract_end: [{ amount: number }]
  copy_debug: [string]
  copy_progress: [{ filename: string; dest: string }]
  copy_end: [{ amount: number }]
}

export interface DownloaderEvents {
  download_progress: [
    {
      total: { amount: number; size: number }
      downloaded: { amount: number; size: number }
      speed: number
      /**
       * @workInProgress Currently not working well.
       */
      eta: number
      type: string
    }
  ]
  download_error: [{ filename: string; type: string; message: Error | string }]
  download_end: [{ downloaded: { amount: number; size: number } }]
}

export interface CleanerEvents {
  clean_progress: [{ filename: string }]
  clean_end: [{ amount: number }]
}
