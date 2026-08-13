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

export interface SignedUrlOptions {
  /** Number of seconds the URL stays valid for. */
  expiresIn: number
  /** Value for the download response's Content-Disposition header. */
  contentDisposition?: string
  /** Value for the download response's Content-Type header. */
  contentType?: string
}

export abstract class Storage<O extends StorageOptions = any> {
  public readonly options: O
  public directoryNormalized: string

  constructor(options: O) {
    this.options = options
    const directory = this.options.directory || ''
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

  /**
   * Whether this backend can mint time-limited signed URLs for direct client
   * access. Backends that cannot (e.g. local disk) leave this false; callers
   * should check it before relying on {@link getSignedUrl}.
   */
  public supportsSignedUrls(): boolean {
    return false
  }

  /**
   * Returns a time-limited URL that grants direct read access to `filePath`,
   * letting a client download straight from the provider instead of proxying
   * the bytes through this process (which also gives native range/resume).
   *
   * Overridden by backends where {@link supportsSignedUrls} is true; the
   * default rejects so unsupported backends fail loudly rather than silently.
   */
  public getSignedUrl(
    _filePath: string,
    _options: SignedUrlOptions
  ): Promise<string> {
    return Promise.reject(
      new Error('This storage backend does not support signed URLs.')
    )
  }

  public pathAbs(path: string) {
    const pathNormalized = path.charAt(0) === '/' ? path.substring(1) : path
    return this.directoryNormalized.length > 0
      ? `${this.directoryNormalized}/${pathNormalized}`
      : pathNormalized
  }
}
