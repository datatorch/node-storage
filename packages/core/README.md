# Storage Core

In many applications the ability dynamically change storage is a must. This
package provides an class for `Storage` and implements a basic local storage
class.

Built with extensibility in mind, you can also implement your owner storage
mount. You need to implement `Storage` from `storage-core`

List of currently supported storage options:

- [Local](https://www.npmjs.com/package/storage-core)
- [AWS S3](https://www.npmjs.com/package/storage-aws)
- [Azure Blob](https://www.npmjs.com/package/storage-azure)
- [Google Cloud Bucket](https://www.npmjs.com/package/storage-gcp)

If you have created a storage that implements the Storage class. Please share it
on the GitHub repository to have it added to this list.

Usage samples can be found on the repository [here](https://github.com/datatorch/node-storage/tree/master/packages/samples).
