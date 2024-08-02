/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { DownloaderEvents } from '../../types/events'
import EventEmitter from '../utils/events'
import { Config } from './../../types/config.d'

export default class Launcher extends EventEmitter<DownloaderEvents> {
  private config: Config

  /**
   * @param config The configuration of the launcher.
   */
  constructor(config: Config) {
    super()

    this.config = config

    this.config.ignored = this.config.ignored || [
      'runtime/',
      'crash-reports/',
      'logs/',
      'resourcepacks/',
      'resources/',
      'saves/',
      'shaderpacks/',
      'options.txt',
      'optionsof.txt'
    ]
    this.config.minecraft.loader = this.config.minecraft.loader || 'vanilla'
    this.config.minecraft.args = this.config.minecraft.args || []
    this.config.java = {
      install: this.config.java?.install || 'auto',
      path: this.config.java?.path || 'runtime/jre/bin/',
      args: this.config.java?.args || []
    }
    this.config.window = {
      width: this.config.window?.width || 854,
      height: this.config.window?.height || 480,
      fullscreen: this.config.window?.fullscreen || false
    }
    this.config.memory = {
      min: this.config.memory?.min || 1024,
      max: this.config.memory?.max || 2048
    }
    console.log(this.config)
  }
}
