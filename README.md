# Node File Storage

In many applications the ability to dynamically change or read files from
different storage providers is a must. These packages provides a implementation
for `Storage` to standardize common functions.

This repository contains the core class along with implementations.

Usage samples can be found on the repository [here](https://github.com/datatorch/node-storage/tree/master/packages/samples).

## The gist

Install the packages you need:

```sh
# Local Storage
$ yarn add storage-core

# Azure Storage
$ yarn add storage-azure

# AWS Storage
$ yarn add storage-aws

# Google Cloud Storage
$ yarn add storage-gcp
```

Create a storage instance with the required configuration and write to it.

```ts
import { LocalStorage } from 'storage-core'
import { AzureBlobStorage } from 'storage-azure'
import { AwsS3Storage } from 'storage-aws'

// Write to local folder
const ls = new LocalStorage({ path: process.env.PATH })
await ls.writeFile('local-write/test.txt', 'using local storage')

// Write to azure blob
const az = new AzureBlobStorage({
  container: process.env.CONTAINER,
  accountName: process.env.ACCOUNT_NAME,
  accountKey: process.env.ACCOUNT_KEY
})
await az.writeFile('azure-write/test.txt', 'using azure storage')

// Write to aws s3
const aws = new AwsS3Storage({
  bucket: process.env.BUCKET,
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY
})
await aws.writeFile('aws-write/test.txt', 'using aws s3 storage')
```
