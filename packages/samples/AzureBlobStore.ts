// import { } from 'storage-azure'
// /**
//  * Samples using Azure Storage
//  *  - Read/Write
//  *  - Read/Write using StorageManager
//  *  - WriteStream
//  */
// ;(async () => {
//   console.log('Buffers will be written to console.')
//   // Create local storage
//   const ls = new LocalStorage({ path: './data' })
//   // Write data to test.txt
//   await ls.writeFile('local-write/test.txt', 'using local storage')
//   console.log(await ls.readFile('local-write/test.txt'))

//   // Using storage manager
//   const config = {
//     id: 'example-id',
//     type: 'local',
//     path: './data'
//   }

//   // Create will also insert storage into cache
//   const ls2 = await getStorageManager().create(config)
//   await ls2.writeFile('local-write/test2.txt', 'using storage create')
//   console.log(await ls2.readFile('local-write/test2.txt'))

//   // Get storage from cache
//   const ls3 = getStorageManager().get('example-id')
//   await ls3.writeFile('local-write/test3.txt', 'using storage manager get')
//   console.log(await ls3.readFile('local-write/test3.txt'))

//   const ws = await ls3.createWriteStream('local-write/stream.txt')
//   ws.push('writing\n')
//   ws.push('using\n')
//   ws.push('a\n')
//   ws.push('stream\n')
//   ws.push(null)
// })()
