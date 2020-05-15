import { AzureBlobStorage } from 'storage-azure'

import { getStorageManager, getStorageFactory } from 'storage-core'
/**
 * Samples using Azure Storage
 *  - Read/Write
 *  - Read/Write using StorageManager
 *  - WriteStream
 */
;(async () => {
  const config = {
    id: 'example-id',
    type: 'azure-blob',
    container: process.env.CONTAINER || '',
    accountName: process.env.ACCOUNT_NAME || '',
    accountKey: process.env.ACCOUNT_KEY || ''
  }

  // Create local storage
  const ls = new AzureBlobStorage(config)

  // Write data to test.txt
  await ls.writeFile('azure-write/test.txt', 'using azure storage')
  console.log(await ls.readFile('azure-write/test.txt'))

  // Using storage manager

  // Register azure storage
  getStorageFactory().register('azure-blob', AzureBlobStorage)

  // Create will also insert storage into cache
  const ls2 = await getStorageManager().create(config)
  await ls2.writeFile('azure-write/test2.txt', 'using storage create')
  console.log(await ls2.readFile('azure-write/test2.txt'))
  console.log(await ls2.getFileSize('azure-write/test2.txt'))

  // Get storage from cache
  const ls3 = getStorageManager().get('example-id')
  await ls3.writeFile('azure-write/test3.txt', 'using storage manager get')
  console.log(await ls3.readFile('azure-write/test3.txt'))

  const ws = await ls3.createWriteStream('azure-write/stream.txt')
  ws.write('writing\n')
  ws.write('using\n')
  ws.write('a\n')
  ws.write('stream\n')
  ws.end()

  // Read created files from directory
  for await (let path of ls.getFilesStream('azure-write')) {
    console.log(path.name)
  }
})()
