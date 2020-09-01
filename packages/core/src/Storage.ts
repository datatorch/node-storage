import { Readable, Writable } from 'stream'
import { ListResult } from './Files'

export const PathAbs = (index: number = 0) => (
  _: any,
  __: string,
  propDesc: PropertyDescriptor
) => {
  let originalFunction: Function = propDesc.value
  propDesc.value = function () {
    let argValue = arguments[index]
    let newArgs = []
    for (let i = 0; i < arguments.length; i++) newArgs.push(arguments[i])
    newArgs[index] = (this as any).pathAbs(argValue)

    return originalFunction.apply(this, newArgs)
  }
  return propDesc
}

export interface StorageOptions {
  directory?: string
}

export abstract class Storage<O extends StorageOptions = any> {
  public readonly options: O
  public directoryNormalized: string

  constructor(options: O) {
    this.options = options
    const directory = this.options.directory ?? ''
    this.directoryNormalized =
      directory.charAt(0) === '/' ? directory.substring(1) : directory
  }

  abstract getTopLevel(path?: string): Promise<ListResult[]>

  abstract getFilesStream(path?: string): Readable

  abstract readFile(filePath: string): Promise<Buffer>

  abstract writeFile(filePath: string, data: string | Buffer): Promise<void>

  abstract deleteFile(filePath: string): Promise<void>

  abstract getFileSize(filePath: string): Promise<number>

  abstract createWriteStream(filePath: string): Promise<Writable>

  abstract createReadStream(filePath: string): Promise<Readable>

  abstract makeDir(path: string): Promise<void>

  public pathAbs(path: string) {
    const pathNormalized = path.charAt(0) === '/' ? path.substring(1) : path
    return this.directoryNormalized.length > 0
      ? `${this.directoryNormalized}/${pathNormalized}`
      : pathNormalized
  }
}
