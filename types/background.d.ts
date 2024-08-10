import { File } from './file'

export interface Background extends File {
  title?: string
  status: number | boolean
}
