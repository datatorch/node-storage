import { GcpBucketStorage } from 'storage-gcp'
import { getStorageManager, getStorageFactory } from 'storage-core'
/**
 * Samples using google buckets
 *  - Read/Write
 *  - Read/Write using StorageManager
 *  - WriteStream
 */
;(async () => {
  const config = {
    id: 'example-id',
    type: 'gcp-bucket',
    bucket: process.env.BUCKET || '',
    projectId: process.env.PROJECT_ID,
    clientEmail: process.env.CLIENT_EMAIL || '',
    privateKey: (process.env.PRIVATE_KEY || '').replace(
      new RegExp('\\\\n', 'g'),
      '\n'
    )
  }

  // Create gcp storage
  const ls = new GcpBucketStorage(config)

  // Write data to test.txt
  await ls.writeFile('gcp-write/test.txt', 'using gcp storage')
  console.log(await ls.readFile('gcp-write/test.txt'))

  // Using storage manager
  // Register gcp storage
  getStorageFactory().register('gcp-bucket', GcpBucketStorage)

  // Create will also insert storage into cache
  const ls2 = await getStorageManager().create(config)
  await ls2.writeFile('gcp-write/test2.txt', 'using storage create')
  console.log(await ls2.readFile('gcp-write/test2.txt'))
  console.log(await ls2.getFileSize('gcp-write/test2.txt'))

  // Get storage from cache
  const ls3 = getStorageManager().get('example-id')
  await ls3.writeFile('gcp-write/test3.txt', 'using storage manager get')
  console.log(await ls3.readFile('gcp-write/test3.txt'))

  const ws = await ls3.createWriteStream('gcp-write/stream.txt')
  ws.write('writing\n')
  ws.write('using\n')
  ws.write('a\n')
  ws.write('stream\n')
  ws.end()

  // Read created files from directory
  for await (let path of ls.getFilesStream('gcp-write')) {
    console.log(path.name)
  }

  for (let result of await ls.getTopLevel('gcp-write')) {
    console.log(`${result.isFile} | ${result.path}`)
  }
})()
