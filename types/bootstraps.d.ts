import { File } from "./file"

export interface Bootstraps {
  win: File | null
  mac: File | null
  lin: File | null
  version: string
}
