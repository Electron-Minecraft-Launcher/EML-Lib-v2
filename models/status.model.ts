export interface Status {
  success: boolean
  ms?: number
  version?: string
  nameServer?: string
  playersConnect?: number
  playersMax?: number
  message?: string
}
