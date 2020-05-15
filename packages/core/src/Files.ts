export interface ListResult extends ListFile {
  isFile: boolean
}

export interface ListFile {
  name: string
  path: string
  size?: number
  md5Hash?: string
  createdAt?: Date
  updatedAt?: Date
  raw: object
}
