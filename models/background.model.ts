import { File } from './file.model'

export interface Background extends File {
  title?: string
  status: number | boolean
}

