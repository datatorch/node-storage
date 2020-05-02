import { AwsS3Storage } from 'storage-aws'
import { getStorageManager, getStorageFactory } from 'storage-core'
/**
 * Samples using AWS S3 Buckets
 *  - Read/Write
 *  - Read/Write using StorageManager
 *  - WriteStream
 */
;(async () => {
  const config = {
    id: 'example-id',
    type: 'aws-s3',
    bucket: process.env.BUCKET || '',
    accessKeyId: process.env.ACCESS_KEY || '',
    secretAccessKey: process.env.SECRET_KEY || ''
  }

  // Create local storage
  const ls = new AwsS3Storage(config)

  // Write data to test.txt
  await ls.writeFile('aws-write/test.txt', 'using azure storage')
  console.log(await ls.readFile('aws-write/test.txt'))

  // Using storage manager

  // Register azure storage
  getStorageFactory().register('aws-s3', AwsS3Storage)

  // Create will also insert storage into cache
  const ls2 = await getStorageManager().create(config)
  await ls2.writeFile('aws-write/test2.txt', 'using storage create')
  console.log(await ls2.readFile('aws-write/test2.txt'))
  console.log(await ls2.getFileSize('aws-write/test2.txt'))

  // Get storage from cache
  const ls3 = getStorageManager().get('example-id')
  await ls3.writeFile('aws-write/test3.txt', 'using storage manager get')
  console.log(await ls3.readFile('aws-write/test3.txt'))

  const ws = await ls3.createWriteStream('aws-write/stream.txt')
  ws.write('writing\n')
  ws.write('using\n')
  ws.write('a\n')
  ws.write('stream\n')
  ws.end()
})()