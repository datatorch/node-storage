import { Readable, Transform } from 'stream'

export interface ListFile {
  name: string
  size?: number
  md5Hash?: string
  createdAt?: Date
  updatedAt?: Date
  raw: object
}

export class FilesTransform extends Transform {
  constructor(private transform: (object: any) => ListFile) {
    super({ objectMode: true })
  }

  _transform(chunck: object, _: any, done: () => void) {
    this.push(this.transform(chunck))
    done()
  }
}

export class FilesReadable extends Readable {
  array: Array<ListFile> | null | undefined = null

  constructor(
    private readMore: () => Promise<ListFile[] | undefined | null>,
    objectMode: boolean = true
  ) {
    super({ objectMode })
  }

  popPush() {
    if (!this.array) {
      this._read()
      return
    }

    const value = this.array.pop()
    if (!value) return

    const more = this.push(value)
    if (more) this.popPush()
  }

  _read() {
    if (!this.array || this.array.length === 0) {
      this.readMore()
        .then(array => {
          if (!array) {
            this.push(null)
            return
          }
          this.array = array
          this.popPush()
        })
        .catch(err => this.destroy(err))
      return
    }
    this.popPush()
  }
}
